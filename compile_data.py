import os
import json

# Locate workspace root dynamically (script is in A:\GeminiWorkspace\评测网站)
current_dir = os.path.dirname(os.path.abspath(__file__))
workspace_dir = os.path.dirname(current_dir)
answers_dir = os.path.join(workspace_dir, "答案")

models_meta = [
    {
        "id": "deepseek-v4-pro",
        "name": "DeepSeek v4 Pro",
        "score": 142,
        "rank": 1,
        "comment": "客观题全对（包括Q11选BCD）。主观题步骤详尽、逻辑严密，仅Q14因OCR文本错误失分，Q15(2)因误判矛盾未解出具体值扣3分。",
        "file": "2026年高考数学deepseek-v4-pro.md",
        "deductions": {"Q14": 5, "Q15(2)": 3}
    },
    {
        "id": "claude-sonnet-4-6",
        "name": "Claude Sonnet 4.6",
        "score": 142,
        "rank": 1,
        "comment": "主观题数理感知极其敏锐，完美解出Q15(2)的距离1。仅在Q14丢5分，以及Q16(2)向量坐标运算中因一处负号笔误扣除3分。",
        "file": "2026高考数学Claude sonnet4.6.md",
        "deductions": {"Q14": 5, "Q16(2)": 3}
    },
    {
        "id": "kimi-k2-6",
        "name": "Kimi k2.6",
        "score": 141,
        "rank": 3,
        "comment": "客观题全对，步骤规范。但在Q15(2)中误判定矛盾，修改条件解答得到2（扣4分），Q14因typo版本未得分。",
        "file": "2026年高考数学kimi-k2.6.md",
        "deductions": {"Q14": 5, "Q15(2)": 4}
    },
    {
        "id": "gemini-3-5-flash",
        "name": "Gemini 3.5 Flash",
        "score": 141,
        "rank": 3,
        "comment": "推导能力极强，但Q15(2)修改了题目条件（将DE修改为D1E）得到距离2扣除4分，Q14估算错误未得分。",
        "file": "2026年高考数学Gemini 3.5flash.md",
        "deductions": {"Q14": 5, "Q15(2)": 4}
    },
    {
        "id": "glm-5-1-trae",
        "name": "GLM 5.1 (Trae)",
        "score": 125,
        "rank": 5,
        "comment": "客观多选题Q11错选导致0分。Q15(2)修改条件得根号2（扣4分）、Q16(2)相似比方法错误（扣6分）、Q18(2)(ii)计算失误（扣3分）。",
        "file": "2026高考数学glm-5.1（trae）.md",
        "deductions": {"Q11": 6, "Q14": 5, "Q15(2)": 4, "Q16(2)": 6, "Q18(2)(ii)": 3, "Q19(3)(ii)": 1}
    },
    {
        "id": "qwen-3-6-plus",
        "name": "Qwen 3.6 Plus",
        "score": 125,
        "rank": 5,
        "comment": "逻辑清晰，正确解出了Q15(2)的距离1。但客观题Q10、Q11各漏选扣3分，且Q16(2)相似错误扣6分、Q18(2)计算失误扣8分。",
        "file": "2026年高考数学Qwen 3.6Plus.md",
        "deductions": {"Q10": 3, "Q11": 3, "Q14": 5, "Q16(2)": 6, "Q18(2)(i)": 4, "Q18(2)(ii)": 4}
    },
    {
        "id": "glm-5-1-work",
        "name": "GLM 5.1 (work)",
        "score": 124,
        "rank": 7,
        "comment": "客观题优秀（Q11正确选出BCD）。但主观题Q16(2)直接留空扣9分，Q15(2)未能得出最终数值扣3分，单选Q7错选扣5分。",
        "file": "2026高考数学glm-5.1(work).md",
        "deductions": {"Q7": 5, "Q10": 3, "Q14": 5, "Q15(2)": 3, "Q16(2)": 9, "Q19(3)(ii)": 1}
    },
    {
        "id": "mimo-v2-5-pro",
        "name": "Mimo v2.5 Pro",
        "score": 120,
        "rank": 8,
        "comment": "客观题丢分严重：Q7、Q8空缺失10分，Q11错选扣6分，Q10漏选扣3分。主观题Q15(2)未给出具体数值答案扣4分。",
        "file": "2026年高考数学mimo-v2.5-pro.md",
        "deductions": {"Q7": 5, "Q8": 5, "Q10": 3, "Q11": 6, "Q14": 5, "Q15(2)": 4, "Q19(2)": 1, "Q19(3)(ii)": 1}
    },
    {
        "id": "minimax-m3",
        "name": "Minimax m3",
        "score": 116,
        "rank": 9,
        "comment": "细节丢分较多：错失Q7、Q8单选题，Q11错选，Q13极值条件代入失误扣5分，Q16(2)相似比例错误扣6分，Q18(2)(ii)计算错误扣3分。",
        "file": "2026年高考数学minimax-m3.md",
        "deductions": {"Q7": 5, "Q8": 5, "Q11": 3, "Q13": 5, "Q14": 5, "Q16(2)": 6, "Q18(2)(ii)": 3, "Q19(2)": 1, "Q19(3)(ii)": 1}
    }
]

# Read main report (from 答案 folder)
report_path = os.path.join(answers_dir, "2026年高考数学AI模型打分报告.md")
with open(report_path, "r", encoding="utf-8") as f:
    report_content = f.read()

# Load all model markdown files
models_data = []
for meta in models_meta:
    file_path = os.path.join(answers_dir, meta["file"])
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    else:
        print(f"Warning: file {file_path} not found.")
        content = f"File {meta['file']} not found."
    
    model_obj = meta.copy()
    model_obj["content"] = content
    models_data.append(model_obj)

# Create the final JS file (inside current directory)
data_js_path = os.path.join(current_dir, "data.js")
data_payload = {
    "report": report_content,
    "models": models_data
}

with open(data_js_path, "w", encoding="utf-8") as f:
    f.write("// Compiled Gaokao Math AI Grading Data\n")
    f.write("const GAOKAO_DATA = ")
    f.write(json.dumps(data_payload, ensure_ascii=False, indent=2))
    f.write(";\n")

print(f"Success: data.js successfully compiled to {data_js_path}")
