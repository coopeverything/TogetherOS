#!/usr/bin/env python
import os, sys, json, subprocess, tempfile, textwrap, glob
from pathlib import Path

def sh(cmd, cwd=None):
return subprocess.check_output(cmd, text=True, cwd=cwd)

def latest_spec_text():
specs = sorted(glob.glob("specs/.md")) + sorted(glob.glob("specs/.yml")) + sorted(glob.glob("specs/*.yaml"))
if not specs:
return "No spec files found."
return Path(specs[-1]).read_text(encoding="utf-8")

def diff_against_main():
try:
sh(["git","fetch","origin","main","--depth=1"])
except Exception:
pass
try:
return sh(["git","diff","--unified=0","origin/main...HEAD"])
except Exception:
return "No diff available."

def main():
pr_number = os.environ.get("PR_NUMBER", "").strip()
if not pr_number:
print("Missing PR_NUMBER", file=sys.stderr); sys.exit(1)
spec = latest_spec_text()
diff = diff_against_main()
# Build a concise prompt
prompt = f"""
You are a senior engineer. Summarize these proposed changes for a pull request in 200-350 words max.
Sections:

What changed (user-facing)

Files touched (grouped)

How to manually test (bullet list)

Risks & Rollback (short)

SPEC:
{spec}

GIT DIFF (unified, truncated if long):
{diff[:18000]}
"""
# Use OpenAI (model from env or default)
from openai import OpenAI
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
model = os.environ.get("SUMMARY_MODEL","gpt-4o-mini")
resp = client.chat.completions.create(
    model=model,
    messages=[{"role":"system","content":"You produce a crisp PR summary."},
              {"role":"user","content":prompt}],
    temperature=0.2,
)
summary = resp.choices[0].message.content.strip()

with tempfile.NamedTemporaryFile("w", delete=False, suffix=".md", encoding="utf-8") as tmp:
    tmp.write(summary)
    tmp_path = tmp.name

# Comment on the PR (uses GitHub CLI and GITHUB_TOKEN)
subprocess.check_call(["gh","pr","comment",pr_number,"--body-file",tmp_path])
print(summary)
if name == "main":
main()
