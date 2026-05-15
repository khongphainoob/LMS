import warnings
from .provider import get_llm

warnings.warn("model_router is deprecated. Use lms.lms.agents.provider instead.", DeprecationWarning, stacklevel=2)

def get_model(task_name: str, **kwargs):
    """
    DEPRECATED: Use get_llm(task_name) from provider.py instead.
    """
    return get_llm(task_name, **kwargs)