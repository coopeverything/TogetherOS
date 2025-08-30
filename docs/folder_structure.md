# Folder Structure (VPS Runtime)

## VPS Server (runtime)
```
/home/platform/htdocs/platform.local/frontend
  ├── docker-compose.yml     (builds from Dockerfile; exposes 127.0.0.1:3010)
  ├── Dockerfile             (Next.js 14 multi-stage build)
  └── src/
      ├── pages/
      │   ├── _app.tsx
      │   └── signup.tsx
      └── styles/
          └── globals.css
```

## Runtime files
- `/root/ddp.env` (Compose env_file — DB credentials, secrets)  
- `/var/www/html/` (public Nginx docroot, not used by Next container)  

## Recommended additions on VPS
- `scripts/redeploy-frontend.sh` (one-command rebuild/verify; executable)  
- `tailwind.config.js`  
- `postcss.config.js`  
- `README.md` (quickstart + CSS playbook)  

## Permissions
- Keep `/root/ddp.env` readable by root only (0600).  
- App source owned by deploy user; docker group for Compose runner.  

## Local Developer Environment (Windows)
Local repo root: `G:\AI-Project\ddp-on-vps`  

SSH keys:  
- Private key: `G:\AI-Project\ssh_keys\id_ed25519`  
- Public key:  `G:\AI-Project\ssh_keys\id_ed25519.pub`  

Ensure public key present in:  
- `/root/.ssh/authorized_keys`  
- `/home/platform/.ssh/authorized_keys`  

System OpenSSH tools (Windows):  
- `C:\Windows\System32\OpenSSH\ssh-keygen.exe`  
- `C:\Windows\System32\OpenSSH\ssh-keyscan.exe`  

Other local dev assets:  
- `G:\AI-Project\open-webui\` (local UI experiments; not part of deploy)  

## GitHub Actions Secrets (Deploy Staging)
- SSH_PRIVATE_KEY  
- VPS_HOST = continentjump  
- VPS_IP = <YOUR.VPS.IP.HERE>  
- VPS_USER = platform  
- VPS_PATH = /home/platform/htdocs/platform.local/frontend  
