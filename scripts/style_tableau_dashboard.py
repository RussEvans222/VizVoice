#!/usr/bin/env python3
"""
VizVoice Tableau Dashboard Auto-Styler

Applies VizVoice brand colors and accessibility styling to Tableau dashboards
using the Tableau REST API and XML manipulation.

Requirements:
- tableauserverclient
- lxml
- python-dotenv

Install:
    pip install tableauserverclient lxml python-dotenv

Usage:
    python style_tableau_dashboard.py --workbook "TransitData" --dashboard "TransitData"
"""

import argparse
import sys
import os
from pathlib import Path
import xml.etree.ElementTree as ET
from typing import Dict, Optional
import tableauserverclient as TSC
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# VizVoice Color Palette
VIZVOICE_COLORS = {
    # Brand Colors
    'primary': '#4E79A7',           # VizVoice Primary (Tableau Blue)
    'accent': '#76B7B2',            # VizVoice Accent (Tableau Teal)
    'highlight': '#F28E2B',         # VizVoice Highlight (Tableau Orange)

    # Semantic Colors
    'success': '#59A14F',           # Tableau Green
    'warning': '#F28E2B',           # Tableau Orange
    'error': '#E15759',             # Tableau Red
    'info': '#1565C0',              # Info Blue

    # Neutral Palette
    'gray_50': '#FAFAFA',
    'gray_100': '#F5F5F5',
    'gray_200': '#EEEEEE',
    'gray_300': '#E0E0E0',
    'gray_400': '#BDBDBD',
    'gray_600': '#757575',
    'gray_700': '#616161',
    'gray_800': '#424242',
    'gray_900': '#212121',
    'white': '#FFFFFF',
    'black': '#000000',

    # Chart-specific
    'bg_dashboard': '#FAFAFA',      # Dashboard background
    'bg_chart': '#FFFFFF',          # Chart background
    'border_light': '#EEEEEE',      # Gridlines
    'border_medium': '#E0E0E0',     # Chart borders
    'border_heavy': '#BDBDBD',      # Input borders
    'text_primary': '#212121',      # Titles
    'text_secondary': '#424242',    # Chart titles
    'text_tertiary': '#757575',     # Axis labels
}

# Chart type → color mapping
CHART_COLOR_RULES = {
    'delay_cause': VIZVOICE_COLORS['warning'],      # Orange for delays (warning)
    'on_time': VIZVOICE_COLORS['success'],          # Green for on-time (success)
    'cancellations': VIZVOICE_COLORS['error'],      # Red for cancellations (error)
    'default': VIZVOICE_COLORS['primary'],          # Blue as default
}


class TableauDashboardStyler:
    def __init__(self, server_url: str, token_name: str, token_value: str, site_id: str = ''):
        """Initialize Tableau Server connection."""
        self.server_url = server_url
        self.site_id = site_id

        # Create authentication
        self.tableau_auth = TSC.PersonalAccessTokenAuth(
            token_name=token_name,
            personal_access_token=token_value,
            site_id=site_id
        )

        # Create server connection
        self.server = TSC.Server(server_url, use_server_version=True)

    def find_workbook(self, workbook_name: str) -> Optional[TSC.WorkbookItem]:
        """Find workbook by name."""
        with self.server.auth.sign_in(self.tableau_auth):
            all_workbooks, _ = self.server.workbooks.get()
            for wb in all_workbooks:
                if wb.name == workbook_name:
                    return wb
        return None

    def download_workbook(self, workbook_item: TSC.WorkbookItem, output_path: Path) -> Path:
        """Download workbook as .twbx file."""
        with self.server.auth.sign_in(self.tableau_auth):
            file_path = self.server.workbooks.download(workbook_item.id, filepath=str(output_path))
            return Path(file_path)

    def extract_twb_from_twbx(self, twbx_path: Path, extract_dir: Path) -> Path:
        """Extract .twb XML file from .twbx package."""
        import zipfile

        with zipfile.ZipFile(twbx_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)

        # Find the .twb file
        twb_files = list(extract_dir.glob('*.twb'))
        if not twb_files:
            raise FileNotFoundError(f"No .twb file found in {twbx_path}")

        return twb_files[0]

    def style_dashboard(self, twb_path: Path, dashboard_name: str) -> None:
        """Apply VizVoice styling to dashboard XML."""
        tree = ET.parse(twb_path)
        root = tree.getroot()

        # Find the target dashboard
        dashboards = root.findall(".//dashboard[@name]")
        target_dashboard = None
        for dashboard in dashboards:
            if dashboard.get('name') == dashboard_name:
                target_dashboard = dashboard
                break

        if target_dashboard is None:
            print(f"❌ Dashboard '{dashboard_name}' not found in workbook")
            return

        print(f"✅ Found dashboard: {dashboard_name}")

        # Apply styling changes
        self._apply_dashboard_background(target_dashboard)
        self._apply_chart_colors(root)
        self._apply_typography(root)
        self._apply_borders_and_gridlines(root)
        self._update_dashboard_title(target_dashboard, dashboard_name)

        # Save modified XML
        tree.write(twb_path, encoding='utf-8', xml_declaration=True)
        print(f"✅ Saved styled workbook to {twb_path}")

    def _apply_dashboard_background(self, dashboard_element: ET.Element) -> None:
        """Set dashboard background to Gray 50 (#FAFAFA)."""
        # Find or create style element
        style = dashboard_element.find('style')
        if style is None:
            style = ET.SubElement(dashboard_element, 'style')

        # Set background color
        style_rules = style.find('style-rule')
        if style_rules is None:
            style_rules = ET.SubElement(style, 'style-rule')
            style_rules.set('element', 'worksheet')

        # Add format element for background
        format_elem = style_rules.find("format[@attr='background-color']")
        if format_elem is None:
            format_elem = ET.SubElement(style_rules, 'format')
            format_elem.set('attr', 'background-color')
            format_elem.set('value', VIZVOICE_COLORS['bg_dashboard'])
        else:
            format_elem.set('value', VIZVOICE_COLORS['bg_dashboard'])

        print(f"  ✓ Set dashboard background to {VIZVOICE_COLORS['bg_dashboard']}")

    def _apply_chart_colors(self, root: ET.Element) -> None:
        """Apply semantic colors to charts based on their data context."""
        worksheets = root.findall('.//worksheet')

        for worksheet in worksheets:
            ws_name = worksheet.get('name', '').lower()

            # Detect chart type from name and apply appropriate color
            if 'delay' in ws_name or 'cause' in ws_name:
                color = CHART_COLOR_RULES['delay_cause']
                chart_type = 'Delay/Cause (Warning Orange)'
            elif 'on-time' in ws_name or 'ontime' in ws_name or 'performance' in ws_name:
                color = CHART_COLOR_RULES['on_time']
                chart_type = 'On-Time (Success Green)'
            elif 'cancel' in ws_name or 'cancelled' in ws_name:
                color = CHART_COLOR_RULES['cancellations']
                chart_type = 'Cancellations (Error Red)'
            else:
                color = CHART_COLOR_RULES['default']
                chart_type = 'Default (Primary Blue)'

            # Apply color to worksheet
            self._set_worksheet_color(worksheet, color)
            print(f"  ✓ Applied {chart_type} to worksheet: {worksheet.get('name')}")

    def _set_worksheet_color(self, worksheet: ET.Element, color: str) -> None:
        """Set fill color for worksheet marks."""
        # Find or create style element
        style = worksheet.find('style')
        if style is None:
            style = ET.SubElement(worksheet, 'style')

        # Find panes
        panes = worksheet.findall('.//panes/pane')
        for pane in panes:
            encodings = pane.find('encodings')
            if encodings is None:
                encodings = ET.SubElement(pane, 'encodings')

            # Set color encoding
            color_elem = encodings.find("color[@column='[None]']")
            if color_elem is None:
                color_elem = ET.SubElement(encodings, 'color')
                color_elem.set('column', '[None]')

            # Add palette
            palette = color_elem.find('palette')
            if palette is None:
                palette = ET.SubElement(color_elem, 'palette')
                palette.set('type', 'regular')

            # Set color
            palette.set('value', color)

    def _apply_typography(self, root: ET.Element) -> None:
        """Apply VizVoice typography (font sizes, weights, colors)."""
        # Dashboard titles
        dashboards = root.findall('.//dashboard')
        for dashboard in dashboards:
            title = dashboard.find('.//zone[@name="title"]')
            if title is not None:
                # Apply title styling
                self._set_text_style(title, {
                    'font-size': '18',
                    'font-weight': 'bold',
                    'color': VIZVOICE_COLORS['text_primary']
                })

        # Worksheet titles
        worksheets = root.findall('.//worksheet')
        for worksheet in worksheets:
            title = worksheet.find('.//title')
            if title is not None:
                self._set_text_style(title, {
                    'font-size': '14',
                    'font-weight': 'normal',
                    'color': VIZVOICE_COLORS['text_secondary']
                })

        print(f"  ✓ Applied typography (titles, labels)")

    def _set_text_style(self, element: ET.Element, styles: Dict[str, str]) -> None:
        """Apply text styling to an element."""
        style = element.find('style')
        if style is None:
            style = ET.SubElement(element, 'style')

        for attr, value in styles.items():
            format_elem = ET.SubElement(style, 'format')
            format_elem.set('attr', attr)
            format_elem.set('value', value)

    def _apply_borders_and_gridlines(self, root: ET.Element) -> None:
        """Apply border and gridline colors."""
        worksheets = root.findall('.//worksheet')

        for worksheet in worksheets:
            # Apply gridline color (light gray)
            self._set_gridline_color(worksheet, VIZVOICE_COLORS['border_light'])

            # Apply border color (medium gray)
            self._set_border_color(worksheet, VIZVOICE_COLORS['border_medium'])

        print(f"  ✓ Applied borders and gridlines")

    def _set_gridline_color(self, worksheet: ET.Element, color: str) -> None:
        """Set gridline color for worksheet."""
        style = worksheet.find('style')
        if style is None:
            style = ET.SubElement(worksheet, 'style')

        # Add gridline style rule
        style_rule = ET.SubElement(style, 'style-rule')
        style_rule.set('element', 'gridline')

        format_elem = ET.SubElement(style_rule, 'format')
        format_elem.set('attr', 'line-color')
        format_elem.set('value', color)

    def _set_border_color(self, worksheet: ET.Element, color: str) -> None:
        """Set border color for worksheet."""
        style = worksheet.find('style')
        if style is None:
            style = ET.SubElement(worksheet, 'style')

        # Add border style rule
        style_rule = ET.SubElement(style, 'style-rule')
        style_rule.set('element', 'worksheet')

        format_elem = ET.SubElement(style_rule, 'format')
        format_elem.set('attr', 'border-color')
        format_elem.set('value', color)

    def _update_dashboard_title(self, dashboard: ET.Element, old_name: str) -> None:
        """Update dashboard title to 'VizVoice Transit Analytics'."""
        # Find title zone
        zones = dashboard.findall('.//zone')
        for zone in zones:
            if zone.get('name') == 'title' or 'title' in zone.get('id', '').lower():
                # Update text content
                text_elem = zone.find('.//text')
                if text_elem is not None:
                    if 'TransitData' in text_elem.text or old_name in text_elem.text:
                        text_elem.text = 'VizVoice Transit Analytics'
                        print(f"  ✓ Updated title to: VizVoice Transit Analytics")

    def repackage_twbx(self, twb_path: Path, extract_dir: Path, output_twbx: Path) -> None:
        """Repackage .twb back into .twbx."""
        import zipfile

        with zipfile.ZipFile(output_twbx, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Add all files from extract directory
            for file in extract_dir.rglob('*'):
                if file.is_file():
                    arcname = file.relative_to(extract_dir)
                    zipf.write(file, arcname)

        print(f"✅ Created styled workbook: {output_twbx}")

    def upload_workbook(self, workbook_item: TSC.WorkbookItem, twbx_path: Path) -> None:
        """Upload modified workbook back to Tableau Server."""
        with self.server.auth.sign_in(self.tableau_auth):
            self.server.workbooks.publish(
                workbook_item=workbook_item,
                file=str(twbx_path),
                mode=TSC.Server.PublishMode.Overwrite
            )
        print(f"✅ Uploaded styled workbook to Tableau Server")


def main():
    parser = argparse.ArgumentParser(description='Apply VizVoice styling to Tableau dashboards')
    parser.add_argument('--workbook', required=True, help='Workbook name (e.g., "TransitData")')
    parser.add_argument('--dashboard', required=True, help='Dashboard name within workbook')
    parser.add_argument('--server', default=os.getenv('TABLEAU_SERVER_URL'), help='Tableau Server URL')
    parser.add_argument('--token-name', default=os.getenv('TABLEAU_TOKEN_NAME'), help='Personal Access Token name')
    parser.add_argument('--token-value', default=os.getenv('TABLEAU_TOKEN_VALUE'), help='Personal Access Token value')
    parser.add_argument('--site', default=os.getenv('TABLEAU_SITE_ID', ''), help='Site ID (optional)')
    parser.add_argument('--output-dir', default='./styled_workbooks', help='Output directory for styled workbooks')

    args = parser.parse_args()

    # Validate required parameters
    if not all([args.server, args.token_name, args.token_value]):
        print("❌ Error: Missing required Tableau Server credentials")
        print("   Set environment variables or pass --server, --token-name, --token-value")
        sys.exit(1)

    # Create output directory
    output_dir = Path(args.output_dir)
    output_dir.mkdir(exist_ok=True, parents=True)

    print(f"\n🎨 VizVoice Tableau Dashboard Styler")
    print(f"=" * 60)
    print(f"Workbook: {args.workbook}")
    print(f"Dashboard: {args.dashboard}")
    print(f"Server: {args.server}")
    print(f"=" * 60 + "\n")

    # Initialize styler
    styler = TableauDashboardStyler(
        server_url=args.server,
        token_name=args.token_name,
        token_value=args.token_value,
        site_id=args.site
    )

    # Step 1: Find workbook
    print("📥 Step 1: Finding workbook...")
    workbook = styler.find_workbook(args.workbook)
    if not workbook:
        print(f"❌ Workbook '{args.workbook}' not found on server")
        sys.exit(1)
    print(f"✅ Found workbook: {workbook.name} (ID: {workbook.id})")

    # Step 2: Download workbook
    print("\n📥 Step 2: Downloading workbook...")
    twbx_path = output_dir / f"{args.workbook}_original.twbx"
    downloaded_path = styler.download_workbook(workbook, twbx_path)
    print(f"✅ Downloaded to: {downloaded_path}")

    # Step 3: Extract .twb
    print("\n📦 Step 3: Extracting workbook XML...")
    extract_dir = output_dir / f"{args.workbook}_extract"
    extract_dir.mkdir(exist_ok=True)
    twb_path = styler.extract_twb_from_twbx(downloaded_path, extract_dir)
    print(f"✅ Extracted to: {twb_path}")

    # Step 4: Apply styling
    print(f"\n🎨 Step 4: Applying VizVoice styling to '{args.dashboard}'...")
    styler.style_dashboard(twb_path, args.dashboard)

    # Step 5: Repackage
    print("\n📦 Step 5: Repackaging workbook...")
    styled_twbx = output_dir / f"{args.workbook}_vizvoice_styled.twbx"
    styler.repackage_twbx(twb_path, extract_dir, styled_twbx)

    # Step 6: Upload (optional)
    upload = input("\n🚀 Upload styled workbook to Tableau Server? (y/n): ").strip().lower()
    if upload == 'y':
        print("\n📤 Step 6: Uploading styled workbook...")
        styler.upload_workbook(workbook, styled_twbx)
    else:
        print(f"\n✅ Styled workbook saved locally: {styled_twbx}")
        print("   To upload manually, use Tableau Desktop or the web interface")

    print("\n" + "=" * 60)
    print("✅ VizVoice styling complete!")
    print("=" * 60)


if __name__ == '__main__':
    main()
