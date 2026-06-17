# YTM Player

Reproductor de YouTube Music sin cuenta. Busca canciones y reproduce el audio directamente en el navegador.

## Características

- Búsqueda en YouTube Music sin necesidad de iniciar sesión
- Reproducción de audio vía stream directo (sin proxy)
- Pre-cache automático de streams para reproducción instantánea
- Controles de reproducción: play/pause, anterior/siguiente, barra de progreso, volumen
- Atajo de teclado: `Space` para play/pause
- Diseño dark mode responsive

## Instalación

```bash
pip install -r requirements.txt
```

## Uso

```bash
python app.py
```

Abrir `http://localhost:5000` en el navegador.

## Estructura

```
API-YT-MUSIC/
├── app.py                  # Entry point
├── backend/
│   ├── server.py           # Rutas Flask
│   ├── ytmusic.py          # Lógica de búsqueda
│   └── stream.py           # Extracción de audio + caché
├── static/
│   ├── css/style.css       # Estilos
│   └── js/player.js        # Lógica del frontend
└── templates/index.html    # Página principal
```

## Tecnologías

- **Backend:** Python, Flask
- **Frontend:** HTML, CSS, JavaScript (Font Awesome, Google Fonts)
- **APIs:** ytmusicapi (no oficial), yt-dlp
