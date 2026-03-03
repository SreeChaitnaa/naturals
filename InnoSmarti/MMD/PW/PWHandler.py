import asyncio
import json
import time

from playwright.async_api import async_playwright
import subprocess
import platform
import os


def launch_chrome():
    system = platform.system()

    profile_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chrome-profile")

    if system == "Darwin":
        subprocess.run(["pkill", "-f", "Google Chrome"])
        time.sleep(1)
        subprocess.Popen([
            "open",
            "-n",
            "-a",
            "Google Chrome",
            "--args",
            "--remote-debugging-port=9222",
            f"--user-data-dir={profile_dir}",
            "--app=https://naturals.innosmarti.com/"
        ])

    elif system == "Windows":
        subprocess.Popen([
            "C:\\Program Files\\Google\\Chrome\\Application\\Chrome.exe",
            "--remote-debugging-port=9222",
            f"--user-data-dir={profile_dir}",
            "--app=https://naturals.innosmarti.com/"
        ])

    else:
        subprocess.Popen([
            "google-chrome",
            "--remote-debugging-port=9222",
            f"--user-data-dir={profile_dir}",
            "--app=https://naturals.innosmarti.com/"
        ])


async def conditional_route(route, request):
    if request.method not in ["POST"]:
        await route.continue_()
        return

    # Only handle POST JSON safely
    try:
        payload = request.post_data_json()
    except Exception:
        payload = None

    if "/getServices/" in str(request.url):
        # 🔹 Log the payload for debugging
        print(f"Intercepted {request.method} request to {request.url}")
        print("Payload:", json.dumps(payload, indent=2))

        response = await route.fetch()
        resp_json = await response.json()
        print("Response from server:", resp_json)
        print("Response Type from server:", type(resp_json))

        # 🔹 Modify the payload as needed (example: add a dummy field)
        if isinstance(resp_json, dict):

            resp_json["dummyField"] = "dummyValue"

            # respond the resp_json
            await route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(resp_json)
            )
        elif isinstance(resp_json, list):

            resp_json.append("dummyValue")

            # respond the resp_json
            await route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(resp_json)
            )
        else:
            # If response is not a dict, just pass it through
            await route.continue_()

    else:
        # 🔹 Let it go untouched
        await route.continue_()


async def main():
    launch_chrome()
    async with async_playwright() as p:
        await asyncio.sleep(1)  # wait for chrome to start

        browser = await p.chromium.connect_over_cdp("http://localhost:9222")
        context = browser.contexts[0]

        # 🔥 Launch Chrome in App/Kiosk mode with persistent profile
        # context = await p.chromium.launch_persistent_context(
        #     user_data_dir="/Users/muralidharmaram/Documents/Git2/naturals/InnoSmarti/MMD/PW/pw-profile",
        #     headless=False,
        #     channel="chrome",  # Use real Chrome
        #     args=[
        #         "--app=https://naturals.innosmarti.com/",
        #         "--no-first-run",
        #         "--no-default-browser-check",
        #         "--disable-blink-features=AutomationControlled",
        #         "--disable-infobars",
        #     ],
        # )

        # 🔥 IMPORTANT → Attach route to CONTEXT (not page)
        await context.route("**/api/**", conditional_route)

        print("Browser opened in app mode. Close it manually to exit...")

        page = context.pages[0]
        await page.wait_for_event("close", timeout=0)
        await context.close()

        print("Browser process terminated cleanly.")

if __name__ == "__main__":
    asyncio.run(main())