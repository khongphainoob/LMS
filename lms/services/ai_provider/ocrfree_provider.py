class OCR_FreeProvider:
    def __init__(self, api_key: str = None, model_name: str = None, api_url: str = None, config: dict = None):
        self.api_key = api_key
        self.model_name = model_name
        self.api_url = api_url
        self.config = config

    def OCR(self, image_data: bytes) -> str:
        import requests
        url = 'https://api.ocr.space/parse/image'
        
        payload = {
            'apikey': self.api_key,
            'language': 'auto',
            'OCREngine': 2,
            'filetype': 'JPG',
        }
        
        try:
            response = requests.post(
                url,
                files={'file': image_data},
                data=payload,
                timeout=60,
            )

            if response.status_code == 200:
                result = response.json()
                if isinstance(result, dict) and result.get('OCRExitCode') == 1:
                    return result['ParsedResults'][0]['ParsedText']
                else:
                    raise Exception(f"API error: {result.get('ErrorMessage', 'Unknown error')}")
            else:
                raise Exception(f"HTTP error {response.status_code}: {response.text}")
        except Exception as e:
            raise Exception(f"OCR processing failed: {str(e)}")