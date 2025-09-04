import os
import sys
import subprocess
import json
import platform
import psutil  # pip install psutil

NODE_ENTRY = "server.js"

def kill_process(proc_name, match_str=None):
    """
    Kill processes by name, and optionally if their cmdline contains match_str.
    """
    for proc in psutil.process_iter(attrs=["pid", "name", "cmdline"]):
        try:
            pname = proc.info["name"].lower()
            if proc_name.lower() in pname:
                cmdline = " ".join(proc.info.get("cmdline") or [])
                if match_str and match_str not in cmdline:
                    continue
                print(f"🔴 Killing {proc_name} process {proc.info['pid']} ({cmdline})")
                proc.kill()
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

def main():
    # Load settings.json
    settings_file = os.path.join(os.path.dirname(__file__), "settings.json")
    with open(settings_file, "r") as f:
        settings = json.load(f)

    system = platform.system()
    if system not in settings:
        print(f"❌ No config found for {system}")
        sys.exit(1)

    chrome_url = settings["chrome_url"]
    cfg = settings[system]
    chrome_profile = cfg["chrome_profile"]

    # Ensure profile dir exists
    os.makedirs(chrome_profile, exist_ok=True)

    # Node project dir = launcher's dir
    node_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(node_dir)

    # Kill old Node (only matching server.js)
    kill_process("node", match_str=NODE_ENTRY)

    # Kill old Chrome (only matching our profile dir)
    kill_process("chrome", match_str=chrome_profile)

    # Start Node server
    node_cmd = ["node", NODE_ENTRY]
    subprocess.Popen(node_cmd, cwd=node_dir, shell=False)
    print(f"✅ Started Node server: {NODE_ENTRY} in {node_dir}")

    # Start Chrome app with profile
    if system == "Windows":
        chrome_cmd = [
            "cmd", "/c", "start", "chrome",
            f"--user-data-dir={chrome_profile}",
            f"--app={chrome_url}"
        ]
    elif system == "Darwin":  # macOS
        chrome_cmd = [
            "open", "-a", "Google Chrome",
            "--args",
            f"--user-data-dir={chrome_profile}",
            f"--app={chrome_url}"
        ]
    else:
        print("❌ Unsupported OS")
        sys.exit(1)

    subprocess.Popen(chrome_cmd, shell=False)
    print(f"✅ Launched Chrome app at {chrome_url} using profile {chrome_profile}")

    print("🚀 Launcher exiting (services continue running).")

if __name__ == "__main__":
    main()
