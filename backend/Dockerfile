FROM python:3.14-slim

RUN apt-get update && apt-get install curl -y && apt-get clean

WORKDIR /app
ARG MODEL_NAME
ARG HF_USERNAME
ENV MODEL_NAME=${MODEL_NAME}
ENV BASE_URL="https://huggingface.co/${HF_USERNAME}/sam-encoders/resolve/main/${MODEL_NAME}"
ENV MODEL_DIR=/app/models
ENV MODEL_PATH="${MODEL_DIR}/${MODEL_NAME}"


RUN mkdir -p "${MODEL_DIR}"

RUN --mount=type=secret,id=HF_AUTH_TOKEN,mode=0444,required=true \
    curl -fL -o "${MODEL_PATH}" \
      -H "Authorization: Bearer $(cat /run/secrets/HF_AUTH_TOKEN)" \
      "${BASE_URL}"

COPY pyproject.toml uv.lock ./

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir uv \
    && uv sync --locked --no-dev --no-install-project

COPY . .

EXPOSE 5000

CMD ["uv", "run", "fastapi", "run", "main.py", "--port", "5000", "--workers", "2"]
