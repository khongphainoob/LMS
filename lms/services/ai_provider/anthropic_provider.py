from .base_provider import BaseAIProvider
import anthropic

class AnthropicProvider(BaseAIProvider):
    def __init__(self, api_key: str = None, model_name: str = "claude-3-haiku-20240307"):
        self._api_key = api_key
        self._model_name = model_name
        self._token_usage = 0
        self._request_count = 0
        
        if self._api_key:
            anthropic.api_key = self._api_key

    def complete(self, prompt: str, model: str = None, schema: dict = None) -> dict:
        target_model = model or self._model_name
        
        # Anthropic không hỗ trợ JSON schema trực tiếp trong API call như Gemini
        # Cần xử lý validation thủ công hoặc dùng thư viện bên ngoài
        # Ở đây ta chỉ truyền prompt và nhận text response
        
        response = anthropic.Anthropic().messages.create(
            model=target_model,
            max_tokens=1000,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        # Lấy thông tin usage
        usage = response.usage
        self._token_usage += usage.total_tokens
        self._request_count += 1
        
        return {
            "text": response.content[0].text,
            "usage": {
                "prompt_tokens": usage.input_tokens,
                "completion_tokens": usage.output_tokens,
                "total_tokens": usage.total_tokens
            },
            "model": target_model
        }

    def get_token_usage(self) -> int:
        return self._token_usage

    def get_request_count(self) -> int:
        return self._request_count

    def get_model_name(self) -> str:
        return self._model_name
    def get_model_info(self, model: str) -> dict:
        # Implement the logic to retrieve model information from Kyma AI API
        # You can make a GET request to the API and return the model details.
        pass
    def list_models(self) -> list:
        # Implement the logic to list all available models from Kyma AI API
        
        pass
    def OCR(self, image_data: bytes) -> str:
        # Implement the logic to perform OCR on the image and return text
        pass
    