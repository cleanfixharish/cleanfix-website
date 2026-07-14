FROM node:22-alpine AS frontend-build
WORKDIR /build/frontend
RUN corepack enable
COPY app/frontend/package.json app/frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY app/frontend/ ./
RUN pnpm build

FROM python:3.12-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=10000 \
    ENVIRONMENT=prod
WORKDIR /app
COPY app/backend/requirements.txt /app/app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/app/backend/requirements.txt
COPY app/backend/ /app/app/backend/
COPY --from=frontend-build /build/frontend/dist /app/app/frontend/dist
WORKDIR /app/app/backend
EXPOSE 10000
CMD ["sh", "-c", "python -m alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
