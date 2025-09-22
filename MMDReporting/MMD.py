import os
import sys
import subprocess
import platform
import psutil  # pip install psutil
import getpass

NODE_ENTRY = "server.js"
CHROME_PROFILE_DIR = "chrome_app_profile"  # relative to node dir

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

def persist_env_var_windows(key, value):
    """Persist environment variable only on Windows."""
    if platform.system() == "Windows":
        subprocess.run(["setx", key, value], shell=True)
        print(f"💾 Saved {key} to Windows environment for future launches.")

def main():
    # Get branch and password from ENV or prompt
    branch = os.environ.get("BRANCH")
    branch_password = os.environ.get("BRANCH_PASSWORD")

    if not branch:
        branch = input("Enter BRANCH name: ").strip()
        if branch:
            persist_env_var_windows("BRANCH", branch)

    if not branch_password:
        branch_password = getpass.getpass("Enter BRANCH_PASSWORD: ").strip()
        if branch_password:
            persist_env_var_windows("BRANCH_PASSWORD", branch_password)

    if not branch or not branch_password:
        print("❌ BRANCH and BRANCH_PASSWORD are required.")
        sys.exit(1)

    # Construct secure Chrome URL
    chrome_url = (
        "https://sreechaitnaa.github.io/naturals/MMDReporting/Reports.html"
        f"?shop={branch}^&psw={branch_password}^&from_store=true"
    )

    system = platform.system()

    # Node project dir = launcher's dir
    node_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(node_dir)

    # Chrome profile inside node dir
    chrome_profile = os.path.join(node_dir, CHROME_PROFILE_DIR)
    os.makedirs(chrome_profile, exist_ok=True)

    # Kill old Node (only matching server.js)
    kill_process("node", match_str=NODE_ENTRY)

    # Kill old Chrome (only matching our profile dir)
    kill_process("chrome", match_str=chrome_profile)

    # Start Node server
    node_cmd = ["node", NODE_ENTRY]
    NODE_FLAGS = subprocess.DETACHED_PROCESS | subprocess.CREATE_NO_WINDOW

    subprocess.Popen(
        ["node", NODE_ENTRY],
        cwd=node_dir,
        creationflags=NODE_FLAGS,
        close_fds=True
    )

    print(f"✅ Started Node server: {NODE_ENTRY} in {node_dir}")
    print(f"✅ Chrome launch: {chrome_url}")

    # Start Chrome app with profile
    if system == "Windows":
        chrome_cmd = [
            "cmd", "/c", "start", "chrome",
            f"--user-data-dir={chrome_profile}",
            f"--app={chrome_url}"
            "--start-maximized"
        ]
    elif system == "Darwin":  # macOS
        chrome_binary = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        chrome_cmd = [
            chrome_binary,
            f"--user-data-dir={chrome_profile}",
            f"--app={chrome_url}"
        ]
    else:
        print("❌ Unsupported OS")
        sys.exit(1)

    subprocess.Popen(chrome_cmd, shell=False)
    print(f"✅ Launched Chrome app (profile: {chrome_profile})")
    print("🚀 Launcher exiting (services continue running).")
    exit(0)

if __name__ == "__main__":
    main()
