import logging
import asyncio
from PWHandler import Launcher


logging.getLogger().setLevel(logging.INFO)

if __name__ == '__main__':
    launcher = Launcher(True, True)
    try:
        asyncio.run(launcher.process())
    except KeyboardInterrupt:
        print("Interrupted by user.")
    finally:
        launcher.kill_browser()
