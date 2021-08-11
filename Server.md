# Server configuration

- Digital Ocean
- Project: Everlist
- Droplet: everlist-ubuntu-s-1vcpu-2gb-intel-sfo3-01
  - OS: Ubuntu 20.04 (LTS) x64
  - Memory: 2 GB Memory
  - CPU: 1 Intel vCPU
  - Storage: 50 GB Disk
  - Data Center: San Francisco 3
- Web Server: Nginx
- Firewall Enabled: ufw

## Everlist.org (Forem)

- Repository Cloned to /var/www/forem

## Ghost Writer API (api.ghost-writer.io)

- Repository cloned to /var/www/ghost-writer

## Move LetsEncrypt configurations

```sh
# Old computer
tar zpcvf backup.tar.gz /etc/letsencrypt/

# New computer
tar zxvf backup.tar.gz -C /
```

## Move Docker Volume as a whole

```sh
# Backing up
tar zpcvf backup.tar.gz /var/lib/docker/volumes/forem_db_data/_data/

# Restoring
tar zxvf backup.tar.gz -C /
```