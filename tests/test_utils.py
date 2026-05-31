from markdown_converter.utils import table_to_markdown


def test_table_to_markdown():
    rows = [
        ["Name", "Age"],
        ["Alice", 30],
        ["Bob", 28],
    ]
    result = table_to_markdown(rows)
    assert "| Name | Age |" in result
    assert "| Alice | 30 |" in result
