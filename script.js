async function checkIPs() {
    const ipInput = document.getElementById('ipInput').value;
    const ipList = ipInput.split('\n').filter(ip => ip.trim());
    let results = [];

    // Tampilkan spinner selama proses berlangsung
    document.querySelector('.spinner').style.display = 'block';

    for (const ip of ipList) {
        try {
            const response = await fetch(`http://api.allorigins.win/raw?url=http://api-cek-ip.anggaalfa.my.id/?ip=${ip}`);
            const data = await response.json();

            // Tentukan nilai ProxyVPN
            let proxyVPN = 'DEAD';
            if (data.TYPE && data.TYPE.includes('VPN')) {
                proxyVPN = 'ACTIVE';
            }

            // Ganti STATUSPROXY dengan ProxyVPN dan hilangkan ProxyHTTP/S
            results.push(`
                <div class="ip-box">
                    <div class="ip-header">IP: ${ip}</div>
                    <div class="ip-info">
                        ${Object.entries(data).filter(([key]) => key !== 'REGION' && key !== 'STATUSPROXY').map(([key, value]) => `
                            <div class="output-item">
                                <span class="output-key">${key}:</span>
                                <span class="output-value">${value}</span>
                            </div>
                        `).join('')}
                        <div class="output-item">
                            <span class="output-key">ProxyVPN:</span>
                            <span class="output-value">${proxyVPN}</span>
                        </div>
                    </div>
                </div>
            `);
        } catch (error) {
            results.push(`
                <div class="ip-box">
                    <div class="ip-header">IP: ${ip}</div>
                    <div class="ip-info">
                        <div class="output-item">
                            <span class="output-key">Error:</span>
                            <span class="output-value">${error.message}</span>
                        </div>
                    </div>
                </div>
            `);
        }
    }

    // Sembunyikan spinner setelah proses selesai
    document.querySelector('.spinner').style.display = 'none';
    
    document.getElementById('ipData').innerHTML = results.join('');
}

function downloadResults() {
    const ipDataDiv = document.getElementById('ipData');
    const textResults = [
        '--------------------------------------',
        'HASIL CEK IP :',
        '--------------------------------------',
        ...Array.from(ipDataDiv.querySelectorAll('.ip-box')).map(box => {
            const ipHeader = box.querySelector('.ip-header').innerText.replace('IP: ', '');
            const infoItems = Array.from(box.querySelectorAll('.output-item')).map(item => {
                const key = item.querySelector('.output-key').innerText.replace(':', '');
                const value = item.querySelector('.output-value').innerText;
                return `${key}: ${value}`;
            }).join('\n');
            return `IP: ${ipHeader}\n${infoItems}\n-------------------------------------`;
        })
    ].join('\n');

    const blob = new Blob([textResults], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ip_check_results.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
