FROM node:latest

RUN apt-get update && apt-get install -y openvpn

COPY nordvpn.ovpn /etc/openvpn/nordvpn.ovpn
COPY vpn-password.txt /etc/openvpn/vpn-password.txt
RUN chmod 600 /etc/openvpn/vpn-password.txt

COPY . /app/

WORKDIR /app
RUN npm install

CMD echo "Starting VPN..." && openvpn --config /etc/openvpn/nordvpn.ovpn --askpass /etc/openvpn/vpn-password.txt & sleep 10 && echo "Starting bot..." && node bot.js
