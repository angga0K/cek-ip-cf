async function checkIPs() {
    const ipInput = document.getElementById('ipInput').value;
    let ipList = ipInput.split('\n').filter(ip => ip.trim());

    // Batasi jumlah IP yang dicek hingga 50
    if (ipList.length > 50) {
        alert('Anda hanya dapat mengecek maksimal 50 IP pada satu waktu.');
        ipList = ipList.slice(0, 50); // Hanya ambil 50 IP pertama
    }

    let results = [];
    document.getElementById('ipData').innerHTML = ''; // Kosongkan hasil sebelumnya

    // Tampilkan spinner selama proses berlangsung
    document.querySelector('.spinner').style.display = 'block';

    for (const ip of ipList) {
        let success = false;
        let attempts = 0;
        let maxAttempts = 3;

        while (!success && attempts < maxAttempts) {
            attempts++;
            try {
                const response = await fetch(`https://api.allorigins.win/raw?url=https://api-cek-ip.anggaalfa.my.id/?ip=${ip}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                // Tentukan nilai ProxyVPN
                let proxyVPN = 'DEAD';
                if (data.TYPE && data.TYPE.includes('VPN')) {
                    proxyVPN = 'ACTIVE';
                }

                // Ganti STATUSPROXY dengan ProxyVPN dan hilangkan ProxyHTTP/S
                const result = `
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
                `;
                results.push(result);
                document.getElementById('ipData').innerHTML += result;

                success = true; // Berhasil mendapatkan data, keluar dari loop

                // Berikan delay sebelum melanjutkan ke IP berikutnya
                await new Promise(resolve => setTimeout(resolve, 1500)); // Delay 1.5 detik
            } catch (error) {
                console.error(`Attempt ${attempts} failed for IP: ${ip}, Error: ${error.message}`);
                if (attempts === maxAttempts) {
                    const errorResult = `
                        <div class="ip-box">
                            <div class="ip-header">IP: ${ip}</div>
                            <div class="ip-info">
                                <div class="output-item">
                                    <span class="output-key">Error:</span>
                                    <span class="output-value">${error.message}</span>
                                </div>
                            </div>
                        </div>
                    `;
                    results.push(errorResult);
                    document.getElementById('ipData').innerHTML += errorResult;
                }
            }
        }
    }

    // Sembunyikan spinner setelah proses selesai
    document.querySelector('.spinner').style.display = 'none';
}

function downloadResults() {
    const ipDataDiv = document.getElementById('ipData');
    const textResults = [
        '--------------------------------------',
        'HASIL CEK IP :',
        '--------------------------------------',
        ...Array.from(ipDataDiv.querySelectorAll('.ip-box')).map(box => {
            // Ambil elemen 'ProxyVPN'
            const proxyVPNElement = Array.from(box.querySelectorAll('.output-item')).find(item =>
                item.querySelector('.output-key').innerText.trim() === 'ProxyVPN:'
            );

            if (proxyVPNElement) {
                const proxyVPN = proxyVPNElement.querySelector('.output-value').innerText.trim();
                if (proxyVPN === 'ACTIVE') {
                    const ipHeader = box.querySelector('.ip-header').innerText.replace('IP: ', '');
                    const infoItems = Array.from(box.querySelectorAll('.output-item')).map(item => {
                        const key = item.querySelector('.output-key').innerText.replace(':', '').trim();
                        const value = item.querySelector('.output-value').innerText.trim();
                        return `${key}: ${value}`;
                    }).join('\n');
                    return `IP: ${ipHeader}\n${infoItems}\n-------------------------------------`;
                }
            }
            return '';
        }).filter(result => result !== '')
    ].join('\n');

    // Jika tidak ada hasil yang sesuai dengan ProxyVPN: ACTIVE
    if (textResults.trim() === '--------------------------------------\nHASIL CEK IP :\n--------------------------------------') {
        alert('Tidak ada IP dengan ProxyVPN: ACTIVE ditemukan.');
        return;
    }

    const blob = new Blob([textResults], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ip_check_results.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
        }
        
