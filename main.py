from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from termcolor import colored
import os

# Variables principales
APP_NAME = "Snake Game"
APP_VERSION = "1.0.0"
HOST = "127.0.0.1"
PORT = 8000

# Inicialización de la aplicación
app = FastAPI(title=APP_NAME, version=APP_VERSION)

# Montando archivos estáticos
app.mount("/static", StaticFiles(directory="static"), name="static")

# Configurando templates
templates = Jinja2Templates(directory="templates")

@app.on_event("startup")
async def startup_event():
    print(colored("🐍 Snake Game server starting up...", "green"))
    print(colored(f"✅ Verificando directorios necesarios...", "cyan"))
    
    # Crear directorios si no existen
    try:
        os.makedirs("static/css", exist_ok=True)
        os.makedirs("static/js", exist_ok=True)
        os.makedirs("static/assets", exist_ok=True)
        os.makedirs("templates", exist_ok=True)
        print(colored("✅ Directorios verificados correctamente", "green"))
    except Exception as e:
        print(colored(f"❌ Error al crear directorios: {str(e)}", "red"))

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    try:
        print(colored("🌐 Sirviendo página principal", "blue"))
        return templates.TemplateResponse(
            "index.html",
            {"request": request}
        )
    except Exception as e:
        print(colored(f"❌ Error sirviendo index page: {str(e)}", "red"))
        raise

if __name__ == "__main__":
    import uvicorn
    print(colored("🎮 Iniciando Snake Game Server", "cyan"))
    print(colored(f"🌐 Servidor disponible en http://{HOST}:{PORT}", "yellow"))
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)