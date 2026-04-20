import google.generativeai as genai
from .base_provider import BaseAIProvider

class GeminiProvider(BaseAIProvider):
    def __init__(self, api_key: str = None, model_name: str = "gemini-1.5-flash"):
        # Sử dụng _ thay vì __ để tuân thủ quy ước Python (internal attributes)
        self._api_key = api_key
        self._model_name = model_name
        self._token_usage = 0
        self._request_count = 0
        
        if self._api_key:
            genai.configure(api_key=self._api_key)
        
        self._model = genai.GenerativeModel(self._model_name)

    def complete(self, prompt: str, model: str = None, schema: dict = None) -> dict:
        # Sử dụng model cụ thể nếu được truyền vào, nếu không dùng default
        target_model = genai.GenerativeModel(model) if model else self._model
        
        # Cấu hình generation (hỗ trợ JSON schema nếu có)
        generation_config = None
        if schema:
            generation_config = genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=schema
            )

        response = target_model.generate_content(
            prompt, 
            generation_config=generation_config
        )
        
        # Cập nhật thông số sử dụng
        usage = response.usage_metadata
        self._token_usage += usage.total_token_count
        self._request_count += 1
        
        # Trả về dict để khớp với định nghĩa của BaseAIProvider
        return {
            "text": response.text,
            "usage": {
                "prompt_tokens": usage.prompt_token_count,
                "completion_tokens": usage.candidates_token_count,
                "total_tokens": usage.total_token_count
            },
            "model": model or self._model_name
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
    
