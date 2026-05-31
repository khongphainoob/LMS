lines = open('/mnt/c/Users/Windows/.gemini/antigravity/brain/f86ad9de-1ed6-4338-ae91-ff82d06a1b96/scratch/AIGradingEssayConfig.vue').readlines()
import re
for i, line in enumerate(lines):
    if 'watch(() => newSessionModel.value.course' in line:
        for j in range(i, i+15):
            print(f'{j+1}: {lines[j].strip()}')
        break
