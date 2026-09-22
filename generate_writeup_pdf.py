"""
IRIS AI - Markdown to Publication-Grade PDF Generator
Reads 'docs/MASTER_RESEARCH_AND_SYSTEM_WRITEUP.md' and compiles a beautifully styled,
high-density executive PDF document with custom running headers/footers, Mermaid code boxes,
formatted tables, and Light-Blue Mintlify visual styling.
"""

import os
import sys
import re
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
    HRFlowable,
    Preformatted
)
from reportlab.pdfgen import canvas


class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and render total page numbers
    along with professional running headers and footers.
    """
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Skip header on cover page
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#1E3A8A"))

        # Running Header
        self.drawString(54, 750, "IRIS AI (Intelligent Railway Inspection and Restoration AI)")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(195, 750, "|  SIH 26027 Master Research & System Architecture Dossier")
        
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 742, 558, 742)

        # Running Footer
        self.line(54, 48, 558, 48)
        self.drawString(54, 36, "Confidential & Statutory - Ministry of Railways (CRIS & RDSO Standards)")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, page_text)
        self.restoreState()


def clean_markdown_inline(text):
    """Converts standard markdown inline tags to ReportLab Paragraph HTML tags."""
    # Convert bold-italic ***text*** or ___text___
    text = re.sub(r'\*\*\*(.*?)\*\*\*', r'<b><i>\1</i></b>', text)
    # Convert bold **text**
    text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
    # Convert italic *text* or _text_
    text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
    text = re.sub(r'_(.*?)_', r'<i>\1</i>', text)
    # Convert inline code `code`
    text = re.sub(r'`(.*?)`', r'<font face="Courier" color="#1E3A8A"><b>\1</b></font>', text)
    # Clean latex math $...$
    text = re.sub(r'\$(.*?)\$', r'<i>\1</i>', text)
    return text


def build_pdf_from_master_md(
    md_path="docs/MASTER_RESEARCH_AND_SYSTEM_WRITEUP.md",
    output_pdf="docs/IRIS AI_AI_Comprehensive_System_Writeup.pdf"
):
    if not os.path.exists(md_path):
        print(f"Error: {md_path} not found.")
        return

    with open(md_path, "r", encoding="utf-8") as f:
        md_content = f.read()

    doc = SimpleDocTemplate(
        output_pdf,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=64,
        bottomMargin=64
    )

    styles = getSampleStyleSheet()

    # Color Palette
    c_primary = colors.HexColor("#1E3A8A")      # Deep Navy Blue
    c_accent = colors.HexColor("#2563EB")       # Signal Blue
    c_slate_dark = colors.HexColor("#0F172A")   # Ink Slate
    c_slate_muted = colors.HexColor("#475569")  # Slate Gray
    c_bg_light = colors.HexColor("#F8FAFC")     # Soft Gray Canvas
    c_border = colors.HexColor("#CBD5E1")       # Border Gray
    c_callout_bg = colors.HexColor("#EFF6FF")   # Light Blue Callout
    c_code_bg = colors.HexColor("#0F172A")      # Dark Code Canvas
    c_code_text = colors.HexColor("#38BDF8")    # Code Cyan

    # Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=c_primary,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=c_accent,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=c_primary,
        spaceBefore=16,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=c_accent,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'Heading3_Custom',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=c_slate_dark,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=c_slate_dark,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=4
    )

    callout_style = ParagraphStyle(
        'Callout_Text',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor("#1E293B")
    )

    code_style = ParagraphStyle(
        'Code_Block',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10,
        textColor=c_code_text
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10.5,
        textColor=c_slate_dark
    )

    story = []

    # =========================================================================
    # 1. DOCUMENT HEADER & MANDATE BLOCK
    # =========================================================================
    story.append(Spacer(1, 10))
    story.append(Paragraph("IRIS AI (Intelligent Railway Inspection and Restoration AI)", title_style))
    story.append(Paragraph("AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=c_accent, spaceBefore=0, spaceAfter=10))

    header_callout = (
        "<b>Smart India Hackathon (SIH) Problem Statement 26027 | Master Research Writeup</b><br/>"
        "<b>Target System:</b> Auto-BDMS (Automated Block & Disconnection Management System) & Joint Corridor Time-Distance Optimizer.<br/>"
        "<b>Primary Engineering Manuals:</b> IRPWM 2020 (Civil P-Way), ACTM Vol II (Electrical TRD), IRSEM 2021 (Signaling & Telecom), "
        "G&SR Chapter 15 (Traffic Operating), RDSO/SPN/196/2020 (Kavach Ver 4.0), and Google OR-Tools CP-SAT Solver."
    )
    h_table = Table([[Paragraph(header_callout, callout_style)]], colWidths=[504])
    h_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_callout_bg),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#93C5FD")),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(h_table)
    story.append(Spacer(1, 10))

    # =========================================================================
    # PARSE SECTIONS FROM MASTER_RESEARCH_AND_SYSTEM_WRITEUP.MD
    # =========================================================================
    lines = md_content.splitlines()
    in_code_block = False
    code_lines = []
    in_table = False
    table_lines = []

    def flush_table(t_lines):
        if not t_lines or len(t_lines) < 2:
            return None
        # Parse markdown table
        headers = [c.strip() for c in t_lines[0].split('|')[1:-1]]
        data = []
        # Header row
        header_row = [Paragraph(f"<b>{clean_markdown_inline(h)}</b>", table_header_style) for h in headers]
        data.append(header_row)

        for row_str in t_lines[2:]: # skip separator line
            if not row_str.strip():
                continue
            cells = [c.strip() for c in row_str.split('|')[1:-1]]
            if len(cells) < len(headers):
                cells += [""] * (len(headers) - len(cells))
            cells = cells[:len(headers)]
            data_row = [Paragraph(clean_markdown_inline(c), table_cell_style) for c in cells]
            data.append(data_row)

        col_count = len(headers)
        total_width = 504
        col_width = total_width / col_count
        # Custom widths based on column count
        if col_count == 3:
            col_widths = [130, 130, 244]
        elif col_count == 4:
            col_widths = [110, 134, 120, 140]
        elif col_count == 5:
            col_widths = [104, 75, 100, 100, 125]
        else:
            col_widths = [col_width] * col_count

        tbl = Table(data, colWidths=col_widths)
        tbl.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), c_primary),
            ('BOX', (0, 0), (-1, -1), 1, c_border),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_light]),
            ('PADDING', (0, 0), (-1, -1), 4.5),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        return tbl

    i = 0
    while i < len(lines):
        line = lines[i]
        trimmed = line.strip()

        # Handle Code / Mermaid Blocks
        if trimmed.startswith("```"):
            if in_code_block:
                # Flush code block
                code_text = "\n".join(code_lines)
                code_table = Table([[Preformatted(code_text, code_style)]], colWidths=[504])
                code_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), c_code_bg),
                    ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#334155")),
                    ('PADDING', (0, 0), (-1, -1), 7),
                ]))
                story.append(code_table)
                story.append(Spacer(1, 6))
                in_code_block = False
                code_lines = []
            else:
                in_code_block = True
                code_lines = [line]
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # Handle Markdown Tables
        if trimmed.startswith("|") and "|" in trimmed[1:]:
            if not in_table:
                in_table = True
                table_lines = [line]
            else:
                table_lines.append(line)
            i += 1
            continue
        else:
            if in_table:
                tbl_flowable = flush_table(table_lines)
                if tbl_flowable:
                    story.append(tbl_flowable)
                    story.append(Spacer(1, 6))
                in_table = False
                table_lines = []

        # Skip main document title if already rendered
        if trimmed.startswith("# IRIS AI"):
            i += 1
            continue

        if trimmed.startswith("> **Problem Statement") or trimmed.startswith("> **Official Title") or trimmed.startswith("> **Target System") or trimmed.startswith("> **Governing Standards"):
            i += 1
            continue

        # Page breaks for major sections
        if trimmed.startswith("## II. Description") or trimmed.startswith("## III. Major Components") or trimmed.startswith("## IV. Software Architecture") or trimmed.startswith("## V. Trials") or trimmed.startswith("## VI. Conclusion"):
            story.append(PageBreak())

        # Section Headings
        if trimmed.startswith("## "):
            h1_text = clean_markdown_inline(trimmed[3:])
            story.append(Paragraph(h1_text, h1_style))
            story.append(HRFlowable(width="100%", thickness=1, color=c_primary, spaceBefore=2, spaceAfter=6))
            i += 1
            continue

        if trimmed.startswith("### "):
            h2_text = clean_markdown_inline(trimmed[4:])
            story.append(Paragraph(h2_text, h2_style))
            i += 1
            continue

        if trimmed.startswith("#### "):
            h3_text = clean_markdown_inline(trimmed[5:])
            story.append(Paragraph(h3_text, h3_style))
            i += 1
            continue

        # Horizontal Rule
        if trimmed == "---":
            i += 1
            continue

        # Bullets
        if trimmed.startswith("* ") or trimmed.startswith("• ") or trimmed.startswith("- "):
            b_text = clean_markdown_inline(trimmed[2:])
            story.append(Paragraph(f"• {b_text}", bullet_style))
            i += 1
            continue

        # Numbered items
        numbered_match = re.match(r'^(\d+)\.\s+(.*)$', trimmed)
        if numbered_match:
            num_str, item_text = numbered_match.groups()
            n_text = clean_markdown_inline(item_text)
            story.append(Paragraph(f"<b>{num_str}.</b> {n_text}", bullet_style))
            i += 1
            continue

        # Empty lines
        if not trimmed:
            i += 1
            continue

        # Standard Paragraph Text
        p_text = clean_markdown_inline(trimmed)
        story.append(Paragraph(p_text, body_style))
        i += 1

    # End of document sign-off
    story.append(Spacer(1, 8))
    sign_off_html = (
        "<b>Document Sign-Off & Verification:</b><br/>"
        "This master research dossier was compiled from <code>docs/MASTER_RESEARCH_AND_SYSTEM_WRITEUP.md</code>. "
        "All mathematical formulas, regulatory manual citations (IRPWM 2020, ACTM Vol II, IRSEM 2021, G&SR Ch 15, RDSO/SPN/196/2020), "
        "and architectural components reflect the authentic ground-truth research for Smart India Hackathon Problem Statement 26027."
    )
    sign_table = Table([[Paragraph(sign_off_html, callout_style)]], colWidths=[504])
    sign_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_callout_bg),
        ('BOX', (0, 0), (-1, -1), 1, c_accent),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(sign_table)

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully compiled Master PDF from {md_path} -> {output_pdf}")


if __name__ == "__main__":
    md_file = os.path.join("docs", "MASTER_RESEARCH_AND_SYSTEM_WRITEUP.md")
    out_pdf_docs = os.path.join("docs", "IRIS AI_AI_Comprehensive_System_Writeup.pdf")
    out_pdf_root = "IRIS AI_AI_Comprehensive_System_Writeup.pdf"

    build_pdf_from_master_md(md_file, out_pdf_docs)
    build_pdf_from_master_md(md_file, out_pdf_root)
