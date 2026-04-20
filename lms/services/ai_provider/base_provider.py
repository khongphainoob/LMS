from abc import ABC, abstractmethod
class BaseAIProvider(ABC):
    @abstractmethod
    def complete(self, prompt: str, model: str = None, schema: dict = None) -> dict:
        """Gửi prompt và nhận kết quả theo JSON schema."""
        pass 
    @abstractmethod
    def get_model_info(self, model: str) -> dict:
        """Lấy thông tin chi tiết về một mô hình cụ thể."""
        pass
    @abstractmethod
    def list_models(self) -> list:
        """Liệt kê tất cả các mô hình có sẵn từ nhà cung cấp AI."""
        pass
    @abstractmethod
    def OCR(self, image_data: bytes) -> str:
        """Thực hiện OCR trên hình ảnh và trả về văn bản."""
        pass
