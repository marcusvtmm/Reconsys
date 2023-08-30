let url = window.location.href;
function getServerData() {

    fetch(url + 'data')
        .then(response => response.json())
        .then(serverData => {
            drawRows(serverData, document.getElementById("lista-remedios"))
        })
        .catch(error => {
            console.error('Erro:', error);
        });
}

document.onload = getServerData()

function adicionarRemedio() {
    let infos = [];

    var remedios = document.getElementById("slots-remedio");
    for (let i = 0; i < remedios.rows.length; i++) {
        for (let j = 0; j < remedios.rows[i].cells.length; j++) {

            let isChecked = false
            if (remedios.rows[i].cells[j].firstChild != null) {
                isChecked = remedios.rows[i].cells[j].firstChild.checked
            }

            if (isChecked == true) {
                var day = remedios.rows[0].cells[j].innerHTML
                var time = document.getElementById('horario-remedio').value
                var color = window.getComputedStyle(remedios.rows[i].cells[j]).backgroundColor
                color = color.substring(4, color.length - 1)
                    .replace(/ /g, '')
                    .split(',');

                infos.push({
                    name: document.getElementById("nome-remedio").value,
                    time: time,
                    day: day,
                    color: arrayToHexRgb(color),
                    slot: (21-( j - 1 + 7*i - 7))+(4-i)
                })
            }
        }
    }

    //Envia dados para o servidor
    sendToServer(infos, url + 'data/add')

    drawRows(infos, document.getElementById("lista-remedios"))

    // Limpa os valores dos campos de entrada
    for (let i = 0; i < remedios.rows.length; i++) {
        for (let j = 0; j < remedios.rows[i].cells.length; j++) {
            if (remedios.rows[i].cells[j].firstChild != null) {
                remedios.rows[i].cells[j].firstChild.checked = false
            }
        }
    }
    document.getElementById("nome-remedio").value = "";
    document.getElementById("horario-remedio").value = "";
}

function removerRemedio(botao) {
    // Obtém a linha da tabela a ser removida
    var linha = botao.parentNode.parentNode;
    var celulas = linha.cells;

    var json = {
        name: null,
        time: null,
        day: null,
        color: null,
    };
    for (var i = 0; i < celulas.length; i++) {
        var valorCelula = celulas[i].textContent;
        switch (i) {
            case 0:
                json['name'] = valorCelula; //Remover
                break;
            case 1:
                json['time'] = valorCelula;//Time
                break;
            case 2:
                json['day'] = valorCelula; //Day
                break;
            case 3:
                json['color'] = valorCelula; //Color
                break;

            default:
                break;
        }
    }
    // Remove a linha da tabela
    linha.parentNode.removeChild(linha);
    sendToServer(json, url + 'data/del')
}

function sendToServer(DATA_TO_SEND, URL_DO_SERVIDOR) {
    fetch(URL_DO_SERVIDOR, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(DATA_TO_SEND)
    })
        .then(function (response) {
            if (response.ok) {
            } else {
                throw new Error('Ocorreu um erro ao enviar os dados.');
            }
        })
        .catch(function (error) {
            console.log('Ocorreu um erro na requisição:', error);
        });
}

function drawRows(json, tabela) {
    json.forEach((info) => {
        var newRow = tabela.insertRow();
        for (var data in info) {
            var newCell = newRow.insertCell();
            if (data != 'slot') {
                if (data === 'color') {
                    let div = document.createElement('p')
                    div.innerHTML = info[data]
                    div.style.color = info[data]
                    div.style.backgroundColor = info[data]
                    div.style.width = '100%';
                    div.style.height = '100%';
                    newCell.appendChild(div)
                }
                else {
                    newCell.appendChild(document.createTextNode(info[data]));
                }
            }
        }
        var colunaAcao = newRow.insertCell(4);
        colunaAcao.innerHTML = '<button type="button" class="btn btn-danger btn-sm" onclick="removerRemedio(this)">Remover</button>';
    })
}

function arrayToHexRgb(colorArray) {
    // Verificar se o array possui 3 elementos
    if (colorArray.length !== 3) {
        throw new Error('O array de cores deve conter exatamente 3 elementos.');
    }

    // Converter os valores para valores hexadecimais
    var hexValues = colorArray.map(function (value) {
        // Arredondar o valor para o intervalo entre 0 e 255
        var roundedValue = Math.max(0, Math.min(255, Math.round(value)));

        // Converter para hexadecimal e adicionar o prefixo "0x"
        var hexString = roundedValue.toString(16).padStart(2, '0');

        return hexString;
    });

    // Concatenar os valores hexadecimais e retornar o resultado
    return '#' + hexValues.join('');
}