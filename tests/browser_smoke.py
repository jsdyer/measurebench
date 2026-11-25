"""Exercise the built starter at a project subpath in Chromium."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import shutil
import tempfile
import threading
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def main():
    screenshots = ROOT / "browser-checks"
    screenshots.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory() as temporary:
        shutil.copytree(ROOT / "dist", Path(temporary) / "example-tool")
        server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=temporary))
        threading.Thread(target=server.serve_forever, daemon=True).start()
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch()
                page = browser.new_page(viewport={"width": 1280, "height": 1000})
                errors = []
                page.on("pageerror", lambda error: errors.append(str(error)))
                page.goto(f"http://127.0.0.1:{server.server_port}/example-tool/")
                page.wait_for_selector("#result h2")
                assert "2 hours" in page.locator("#result").inner_text()
                assert "13 minutes" in page.locator("#result").inner_text()
                page.locator("#query").fill("1 TB to GiB")
                page.get_by_role("button", name="Calculate locally").click()
                assert "931.3225746 GiB" in page.locator("#result").inner_text()
                page.locator("#query").fill("2 cups to mL")
                page.get_by_role("button", name="Calculate locally").click()
                assert "ambiguous" in page.locator("#result").inner_text()
                page.locator("#query").fill('<img src=x onerror="alert(1)">')
                page.get_by_role("button", name="Calculate locally").click()
                assert page.locator("img").count() == 0
                page.route("**/api/measurebench/answer", lambda route: route.fulfill(status=200, content_type="application/json", body='{"answer":"A safe test answer","source":"Wolfram Alpha","cached":true}'))
                page.locator("#query").fill("a complicated question")
                page.get_by_role("button", name="Ask Wolfram").click()
                page.wait_for_function("document.getElementById('remote-answer').textContent === 'A safe test answer'")
                assert "cached answer" in page.locator("#remote-status").inner_text()
                page.get_by_role("button", name="Heater energy", exact=True).click()
                assert "12 kWh" in page.locator("#result").inner_text()
                page.screenshot(path=str(screenshots / "desktop.png"), full_page=True)
                page.set_viewport_size({"width": 390, "height": 844})
                assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
                page.screenshot(path=str(screenshots / "mobile.png"), full_page=True)
                assert not errors, errors
                browser.close()
            print("Browser checks passed: conversions, errors, explicit external answers, safe text and mobile layout")
        finally:
            server.shutdown()


if __name__ == "__main__":
    main()
