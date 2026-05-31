import io
import base64
import contextlib
import traceback

def execute_visual_code(python_code: str) -> dict:
    """Executes matplotlib/seaborn code and returns the plot as a base64 image."""
    try:
        # We need to capture matplotlib figure to base64
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        import seaborn as sns
        import numpy as np
        
        plt.clf()
        
        # Execute the code in an isolated dictionary
        local_scope = {}
        global_scope = {
            'plt': plt,
            'sns': sns,
            'np': np
        }
        
        # Run code and capture standard output if needed
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            exec(python_code, global_scope, local_scope)
            
        # Get the plot from current figure
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        plt.close('all')
        
        buf.seek(0)
        img_str = base64.b64encode(buf.read()).decode('utf-8')
        
        return {
            "success": True,
            "image_base64": img_str,
            "output": output.getvalue()
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }
