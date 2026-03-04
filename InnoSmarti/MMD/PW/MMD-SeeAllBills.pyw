import logging
import asyncio
from PWHandler import Launcher


logging.getLogger().setLevel(logging.INFO)

if __name__ == '__main__':
    asyncio.run(Launcher(True, True).process())
