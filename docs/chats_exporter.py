import os
import json
import shutil

source_brain = r"C:\Users\LENOVO\.gemini\antigravity-ide\brain"
project_root = r"c:\Users\LENOVO\Downloads\railwaysurakshai"
docs_chats_dir = os.path.join(project_root, "docs", "chats")
raw_brain_dir = os.path.join(docs_chats_dir, "raw_brain_sessions")

os.makedirs(docs_chats_dir, exist_ok=True)
os.makedirs(raw_brain_dir, exist_ok=True)

conv_dirs = [
    d for d in os.listdir(source_brain)
    if os.path.isdir(os.path.join(source_brain, d)) and d != "tempmediaStorage"
]

index_entries = []

for conv_id in sorted(conv_dirs):
    conv_path = os.path.join(source_brain, conv_id)
    
    # Copy raw session artifacts (md files, plans, walkthroughs, logs)
    dest_raw_conv = os.path.join(raw_brain_dir, conv_id)
    os.makedirs(dest_raw_conv, exist_ok=True)
    
    for item in os.listdir(conv_path):
        s = os.path.join(conv_path, item)
        d = os.path.join(dest_raw_conv, item)
        try:
            if os.path.isdir(s):
                if not os.path.exists(d):
                    shutil.copytree(s, d, dirs_exist_ok=True)
            else:
                shutil.copy2(s, d)
        except Exception as e:
            pass

    log_file = os.path.join(conv_path, ".system_generated", "logs", "transcript_full.jsonl")
    if not os.path.exists(log_file):
        log_file = os.path.join(conv_path, ".system_generated", "logs", "transcript.jsonl")
    
    artifacts = [
        f for f in os.listdir(conv_path)
        if f.endswith(".md") and not f.endswith(".metadata.json")
    ]
    
    first_user_msg = "No user message recorded"
    msg_count = 0
    turns = []
    
    if os.path.exists(log_file):
        with open(log_file, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                    msg_type = obj.get("type")
                    content = obj.get("content", "")
                    tool_calls = obj.get("tool_calls", [])
                    step_index = obj.get("step_index", "")
                    
                    if msg_type == "USER_INPUT":
                        msg_count += 1
                        if first_user_msg == "No user message recorded" and content:
                            first_user_msg = content[:120].replace("\n", " ")
                        turns.append({
                            "role": "USER",
                            "content": content,
                            "step": step_index
                        })
                    elif msg_type == "PLANNER_RESPONSE":
                        thought = obj.get("thought", "")
                        turns.append({
                            "role": "ASSISTANT",
                            "content": content,
                            "thought": thought,
                            "tool_calls": tool_calls,
                            "step": step_index
                        })
                except Exception:
                    pass

    md_filename = f"chat_{conv_id}.md"
    md_filepath = os.path.join(docs_chats_dir, md_filename)
    
    with open(md_filepath, "w", encoding="utf-8") as out:
        out.write(f"# RailSuraksha AI Conversation Session\n\n")
        out.write(f"- **Session ID**: `{conv_id}`\n")
        out.write(f"- **Total User Messages**: {msg_count}\n")
        out.write(f"- **Total Turns & Steps**: {len(turns)}\n")
        if artifacts:
            out.write(f"- **Session Artifacts**: " + ", ".join(f"`{a}`" for a in artifacts) + "\n")
        out.write("\n---\n\n")
        
        for turn in turns:
            role = turn["role"]
            step = turn.get("step", "")
            out.write(f"## [{role}] (Step {step})\n\n")
            if role == "USER":
                out.write(f"{turn['content']}\n\n")
            else:
                if turn.get("thought"):
                    out.write(f"<details><summary><b>Agent Reasoning / Internal Plan</b></summary>\n\n```text\n{turn['thought']}\n```\n\n</details>\n\n")
                if turn.get("content"):
                    out.write(f"{turn['content']}\n\n")
                if turn.get("tool_calls"):
                    out.write(f"<details><summary><b>Actions & Tool Executions ({len(turn['tool_calls'])})</b></summary>\n\n")
                    for tc in turn["tool_calls"]:
                        tool_name = tc.get("name", "tool")
                        out.write(f"#### Tool: `{tool_name}`\n")
                        args = tc.get("args", {})
                        out.write("```json\n" + json.dumps(args, indent=2) + "\n```\n\n")
                    out.write("</details>\n\n")
            out.write("---\n\n")
            
    index_entries.append({
        "id": conv_id,
        "first_msg": first_user_msg,
        "msg_count": msg_count,
        "turns_count": len(turns),
        "file": md_filename,
        "artifacts": artifacts
    })

# Write index file
with open(os.path.join(docs_chats_dir, "README.md"), "w", encoding="utf-8") as out:
    out.write("# RailSuraksha AI - Conversation Transcripts & History\n\n")
    out.write("This directory contains structured Markdown records of all conversation sessions, agent handoffs, user prompts, reasoning steps, tool calls, and plan artifacts generated during development.\n\n")
    out.write("Any Markdown viewer or Antigravity instance can open and inspect these files directly.\n\n")
    out.write("| Session ID | First User Prompt Preview | Messages | Steps | Artifacts | Markdown Transcript |\n")
    out.write("| :--- | :--- | :--- | :--- | :--- | :--- |\n")
    for item in index_entries:
        art_str = ", ".join(item["artifacts"]) if item["artifacts"] else "None"
        preview = item["first_msg"][:75] + ("..." if len(item["first_msg"]) > 75 else "")
        preview = preview.replace("|", "\\|")
        out.write(f"| `{item['id'][:8]}...` | {preview} | {item['msg_count']} | {item['turns_count']} | {art_str} | [{item['file']}](./{item['file']}) |\n")

print(f"Exported {len(index_entries)} chat sessions into {docs_chats_dir}")
