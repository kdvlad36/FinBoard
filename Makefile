.PHONY: help install install-backend install-frontend build build-backend build-frontend \
        start start-backend start-frontend dev dev-backend dev-frontend \
        reset reset-db stop clean

BACKEND_DIR := backend
FRONTEND_DIR := frontend/app
BACKEND_PID := /tmp/finboard-backend.pid
FRONTEND_PID := /tmp/finboard-frontend.pid
DB_FILE := $(BACKEND_DIR)/finboard.sqlite

help:
	@echo "FinBoard — доступные команды:"
	@echo ""
	@echo "  make install        Установить зависимости backend и frontend"
	@echo "  make build          Собрать backend и frontend"
	@echo "  make dev            Запустить backend + frontend в dev-режиме (watch)"
	@echo "  make start          Запустить собранные backend + frontend (prod build)"
	@echo "  make stop           Остановить запущенные процессы"
	@echo "  make reset-db       Удалить БД (пересоздастся с demo-данными при старте)"
	@echo "  make clean          Удалить node_modules, dist, БД"

install: install-backend install-frontend

install-backend:
	cd $(BACKEND_DIR) && yarn install

install-frontend:
	cd $(FRONTEND_DIR) && yarn install

build: build-backend build-frontend

build-backend:
	cd $(BACKEND_DIR) && yarn build

build-frontend:
	cd $(FRONTEND_DIR) && yarn build

dev: stop
	@echo "→ backend: http://localhost:3001"
	@echo "→ frontend: http://localhost:5173"
	@cd $(BACKEND_DIR) && yarn start:dev & echo $$! > $(BACKEND_PID)
	@cd $(FRONTEND_DIR) && yarn dev & echo $$! > $(FRONTEND_PID)
	@wait

dev-backend:
	cd $(BACKEND_DIR) && yarn start:dev

dev-frontend:
	cd $(FRONTEND_DIR) && yarn dev

start: build stop
	@echo "→ backend: http://localhost:3001"
	@echo "→ frontend: http://localhost:4173"
	@cd $(BACKEND_DIR) && node dist/main.js & echo $$! > $(BACKEND_PID)
	@cd $(FRONTEND_DIR) && yarn preview --host --port 4173 & echo $$! > $(FRONTEND_PID)
	@wait

stop:
	@-[ -f $(BACKEND_PID) ] && kill `cat $(BACKEND_PID)` 2>/dev/null || true
	@-[ -f $(FRONTEND_PID) ] && kill `cat $(FRONTEND_PID)` 2>/dev/null || true
	@-pkill -f "nest start" 2>/dev/null || true
	@-pkill -f "node dist/main.js" 2>/dev/null || true
	@-pkill -f "vite" 2>/dev/null || true
	@/bin/rm -f $(BACKEND_PID) $(FRONTEND_PID)
	@echo "stopped"

reset-db: stop
	@/bin/rm -f $(DB_FILE)
	@echo "БД удалена"

clean: stop
	/bin/rm -rf $(BACKEND_DIR)/node_modules $(BACKEND_DIR)/dist $(DB_FILE)
	/bin/rm -rf $(FRONTEND_DIR)/node_modules $(FRONTEND_DIR)/dist
