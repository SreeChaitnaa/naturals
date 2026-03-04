import asyncio
import json
import logging
import time
import aiohttp

from playwright.async_api import async_playwright
import subprocess
import platform
import os

from Settings import Settings
from MMDHandler import MMDHandler, MMDStatus



class Launcher:
    def __init__(self, is_mmd=True, show_invoices=True, store_id=None):
        self.driver = None
        self.is_mmd = is_mmd
        self.settings = Settings(store_id=store_id)
        self.settings.set("show_invoices", show_invoices)
        self.settings.save()
        self.headers = {}
        self.show_invoices = show_invoices
        self.page = None
        self.context = None
        self.port = 9222
        self.path = os.path.dirname(os.path.abspath(__file__))
        self.launch_url = os.path.join(self.path, "Naturals.html") if self.is_mmd else "https://naturals.innosmarti.com"

    def launch_chrome(self):
        system = platform.system()

        profile_dir = os.path.join(self.path, "chrome-profile")
        args = ["C:\\Program Files\\Google\\Chrome\\Application\\Chrome.exe"]

        if system == "Darwin":
            subprocess.run(["pkill", "-f", "Google Chrome"])
            time.sleep(1)
            args = ["open", "-n", "-a", "Google Chrome", "--args"]

        elif system != "Windows":
            args = ["google-chrome"]

        args.extend([f"--remote-debugging-port={self.port}",
                     f"--user-data-dir={profile_dir}",
                     f"--app={self.launch_url}"])

        subprocess.Popen(args)

    async def set_element(self, element_setting):
        selector = element_setting['selector']
        value = element_setting["value"]
        try:

            locator = self.page.locator(selector)

            await locator.wait_for(state="visible", timeout=5000)

            if value == "click":
                await locator.click()
            else:
                await locator.fill(value)
            return True

        except Exception as e:
            print(f"Error interacting with {selector}: {e}")
            return False

    async def conditional_route(self, route, request):
        if not self.is_mmd or request.method not in ["GET", "POST"]:
            await route.continue_()
            return None

        self.headers = request.headers
        payload = None
        if type(request.post_data_json) is dict or type(request.post_data_json) is list:
            payload = request.post_data_json
        mmd_handler = MMDHandler(request.method, request.url, self.settings, logging.getLogger(), payload)

        if mmd_handler.pre_resp_code == MMDStatus.NoServerCall:
            resp = mmd_handler.pre_resp
        else:
            response = await route.fetch()
            resp = await response.json()
            if mmd_handler.pre_resp_code != MMDStatus.ReturnServerCall:
                resp = mmd_handler.post_handler(resp)
        await route.fulfill(status=200, content_type="application/json", body=json.dumps(resp))
        mmd_handler.post_task(resp, self.headers)
        return None

    async def wait_for_chrome_debug(self, timeout=15):
        url = f"http://localhost:{self.port}/json/version"
        start = asyncio.get_event_loop().time()

        while True:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(url) as resp:
                        if resp.status == 200:
                            return
            except Exception:
                pass

            if asyncio.get_event_loop().time() - start > timeout:
                raise RuntimeError("Chrome debugging port not available")

            await asyncio.sleep(0.5)

    async def wait_for_page(self, timeout=15):
        for _ in range(timeout * 10):
            if self.context.pages:
                return self.context.pages[0]
            await asyncio.sleep(0.1)
        raise RuntimeError("No page created by Chrome")

    async def process(self):
        self.launch_chrome()
        async with async_playwright() as p:
            await self.wait_for_chrome_debug()

            browser = await p.chromium.connect_over_cdp(f"http://localhost:{self.port}")
            self.context = browser.contexts[0]

            # 🔥 IMPORTANT → Attach route to CONTEXT (not page)
            await self.context.route("**/api/**", self.conditional_route)

            print("Browser opened in app mode. Close it manually to exit...")

            self.page = await self.wait_for_page()
            if "innosmarti" not in str(self.page.url):
                await asyncio.sleep(5)
                await self.page.goto("https://naturals.innosmarti.com/", wait_until="networkidle")

            if await self.set_element(self.settings.user):
                await self.set_element(self.settings.password)
                await self.set_element(self.settings.login)

            await self.page.wait_for_event("close", timeout=0)
            await self.context.close()

            print("Browser process terminated cleanly.")


if __name__ == "__main__":
    asyncio.run(Launcher().process())