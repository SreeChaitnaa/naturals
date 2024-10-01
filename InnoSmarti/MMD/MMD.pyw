import logging
from Launcher import Launcher


logging.getLogger().setLevel(logging.INFO)

if __name__ == '__main__':
    Launcher(True, False).process()

