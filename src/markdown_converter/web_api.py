"""FastAPI web API for the Markdown Converter.

Provides REST endpoints for file upload, conversion, progress polling,
preview, and download.
"""

from __future__ import annotations

import shutil
import tempfile
import threading
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, PlainTextResponse

from markdown_converter.config import ConvertOptions
from markdown_converter.converter_registry import SUPPORTED_EXTENSIONS
from markdown_converter.service import MarkdownConvertService

app = FastAPI(title="Markdown Converter API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Data models ----

@dataclass
class Result:
    id: str
    file_name: str
    file_path: Path
    preview_url: str
    download_url: str


@dataclass
class Job:
    job_id: str
    status: str = "queued"  # queued | running | success | failed
    progress: int = 0
    current_file: Optional[str] = None
    logs: list[str] = field(default_factory=list)
    results: list[Result] = field(default_factory=list)
    zip_result: Optional[dict] = None
    error: Optional[str] = None
    created_at: float = 0.0


# ---- In-memory storage ----

_jobs: dict[str, Job] = {}
_job_lock = threading.Lock()


def _get_job(job_id: str) -> Job:
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


# ---- Background conversion ----

def _run_conversion(
    job_id: str,
    input_dir: Path,
    output_dir: Path,
    export_assets: bool,
    overwrite: bool,
    zip_output: bool,
) -> None:
    job = _jobs[job_id]
    job.status = "running"
    job.logs.append("Starting conversion...")
    if overwrite:
        job.logs.append("[Warning] Overwrite mode enabled. Existing files will be replaced.")

    service = MarkdownConvertService()
    supported = SUPPORTED_EXTENSIONS

    # Collect all supported files
    files_to_convert: list[Path] = []
    for f in sorted(input_dir.iterdir()):
        if f.is_file() and f.suffix.lower() in supported:
            files_to_convert.append(f)

    if not files_to_convert:
        job.status = "failed"
        job.error = "No supported files found"
        job.logs.append("ERROR: No supported files found in uploaded files")
        return

    total = len(files_to_convert)
    succeeded = 0
    failed_names: list[str] = []

    for idx, src_file in enumerate(files_to_convert):
        job.current_file = src_file.name
        job.logs.append(f"Converting {src_file.name}...")

        options = ConvertOptions(
            output_dir=output_dir,
            export_assets=export_assets,
            overwrite=overwrite,
            recursive=False,
        )

        try:
            md_content = service.convert_file(src_file, options)
            out_name = f"{src_file.stem}.md"
            out_path = output_dir / out_name
            out_path.write_text(md_content.strip() + "\n", encoding="utf-8")

            result_id = uuid.uuid4().hex[:12]
            result = Result(
                id=result_id,
                file_name=out_name,
                file_path=out_path,
                preview_url=f"/api/preview/{result_id}",
                download_url=f"/api/download/{result_id}",
            )
            with _job_lock:
                job.results.append(result)

            job.logs.append(f"[OK] {src_file.name} -> {out_name}")
            succeeded += 1
        except Exception as exc:
            job.logs.append(f"[ERROR] {src_file.name}: {exc}")
            failed_names.append(src_file.name)

        job.progress = round(((idx + 1) / total) * 100)

    # Final status
    if succeeded == 0:
        job.status = "failed"
        job.error = "All files failed to convert"
    else:
        job.status = "success"
        if failed_names:
            job.logs.append(f"Warning: {len(failed_names)} file(s) failed: {', '.join(failed_names)}")

    # Zip output
    if zip_output and succeeded > 0:
        try:
            zip_path = output_dir / "results.zip"
            shutil.make_archive(str(zip_path.with_suffix("")), "zip", output_dir)
            zip_id = uuid.uuid4().hex[:12]
            with _job_lock:
                job.zip_result = {
                    "file_name": "results.zip",
                    "download_url": f"/api/download/zip_{zip_id}",
                }
            # Store zip path mapping (simple: use a special key)
            _jobs[f"_zip_{zip_id}"] = Job(
                job_id=f"_zip_{zip_id}",
                status="success",
                results=[Result(id=f"_zip_{zip_id}", file_name="results.zip", file_path=zip_path, preview_url="", download_url="")],
            )
            job.logs.append("[OK] Created results.zip")
        except Exception as exc:
            job.logs.append(f"[ERROR] Failed to create zip: {exc}")

    job.current_file = None
    job.logs.append("Conversion finished.")


# ---- Result ID to path mapping ----

_result_paths: dict[str, Path] = {}


def _register_results(job: Job) -> None:
    """Register all result paths for lookup by ID."""
    for r in job.results:
        _result_paths[r.id] = r.file_path
    if job.zip_result:
        # Find the zip job and register its path
        for key, j in _jobs.items():
            if key.startswith("_zip_") and j.results:
                zip_id = job.zip_result["download_url"].split("/")[-1]
                _result_paths[zip_id] = j.results[0].file_path


# ---- Endpoints ----

@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/convert")
async def convert(
    files: list[UploadFile] = File(...),
    export_assets: bool = Form(False),
    overwrite: bool = Form(False),
    zip_output: bool = Form(False),
    language: str = Form("en"),
):
    job_id = uuid.uuid4().hex[:12]
    job_dir = Path(tempfile.mkdtemp(prefix="mdconv_"))
    input_dir = job_dir / "input"
    output_dir = job_dir / "output"
    input_dir.mkdir(parents=True)
    output_dir.mkdir(parents=True)

    # Save uploaded files
    for upload_file in files:
        if upload_file.filename:
            dest = input_dir / Path(upload_file.filename).name
            content = await upload_file.read()
            dest.write_bytes(content)

    job = Job(
        job_id=job_id,
        status="queued",
        created_at=0.0,
    )
    _jobs[job_id] = job

    # Start background conversion
    thread = threading.Thread(
        target=_run_conversion,
        args=(job_id, input_dir, output_dir, export_assets, overwrite, zip_output),
        daemon=True,
    )
    thread.start()

    return {"job_id": job_id, "status": "queued"}


@app.get("/api/jobs/{job_id}")
async def get_job(job_id: str):
    job = _get_job(job_id)

    # Register result paths for later lookup
    _register_results(job)

    # Build results list
    results = [
        {
            "id": r.id,
            "file_name": r.file_name,
            "download_url": r.download_url,
            "preview_url": r.preview_url,
        }
        for r in job.results
    ]

    resp: dict = {
        "job_id": job.job_id,
        "status": job.status,
        "progress": job.progress,
        "current_file": job.current_file,
        "logs": list(job.logs),
        "results": results,
        "zip_result": job.zip_result,
        "error": job.error,
    }
    return resp


@app.get("/api/preview/{result_id}", response_class=PlainTextResponse)
async def preview(result_id: str):
    path = _result_paths.get(result_id)
    if not path or not path.exists():
        raise HTTPException(status_code=404, detail="Result not found")
    return PlainTextResponse(path.read_text(encoding="utf-8"))


@app.get("/api/download/{result_id}")
async def download(result_id: str):
    path = _result_paths.get(result_id)
    if not path or not path.exists():
        raise HTTPException(status_code=404, detail="Result not found")
    return FileResponse(
        path=str(path),
        filename=path.name,
        media_type="application/octet-stream",
    )


def run():
    """Entry point: uvicorn markdown_converter.web_api:run"""
    import uvicorn
    uvicorn.run("markdown_converter.web_api:app", host="127.0.0.1", port=8000)
