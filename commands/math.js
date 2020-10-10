let fibonacciTab = []; fibonacciTab["0"] = 0; fibonacciTab["1"] = 1;

const utils = require("./../utils/others.js")

module.exports = {
    name: 'math',
    description: 'Pokazuje ciekawe matematyczne zadania!',
    status: 'on',
    aliases: [],
    package: "default",
    execute: async (Keiko, msg) => {
        let command = Keiko.interpenter.readWord(), sub = [];
        switch (command) {
            case 'percent':
            case '%':
                sub.push(Keiko.interpenter.readPoint())
                if (!sub[0]) {
                    msg.channel.send("Brak mi liczby z której mam liczyć")
                    return
                }
                sub.push(Keiko.interpenter.readPoint())
                if (!sub[1]) {
                    msg.channel.send("Brak mi procencików")
                    return
                }
                msg.channel.send(new Keiko.Discord.RichEmbed().setTitle('Procenciki').addField(`${sub[1]}% z liczby ${sub[0]}`, (sub[0] * sub[1]) / 100))
                break;
            case 'fibonacci':
                sub.push(Math.abs(Keiko.interpenter.readInt()) + 1)
                if (!sub[0]) {
                    msg.channel.send('Podaj miejsce w ciągu które mam pokazać!')
                    return;
                }
                let calcedFibonacci = fibonacci(sub[0])
                if (calcedFibonacci == Infinity) {
                    msg.channel.send(`Miejsce ${sub[0] - 1}, w ciągu fibonacciego jest dla mnie za duża ;-;\nAle mogę ci powiedzieć że jest większa od 1.797693134862315E+308`)
                } else msg.channel.send(`Miejsce ${sub[0] - 1}, w ciągu fibonacciego ma wartość ${fibonacci(sub[0])}`)
                break;
            case 'dzielniki':
                sub.push(Math.abs(Keiko.interpenter.readInt()))
                if (!sub[0]) {
                    msg.channel.send('Z czego ja mam dzielniki pokazać? Hmmm?')
                    return;
                }
                msg.channel.send(new Keiko.Discord.RichEmbed().setTitle('Dzielniczki').addField(`Liczba: ${sub[0]}`, dzielniki(sub[0])))
                break;
            case 'round':
                sub.push(Math.abs(Keiko.interpenter.readPoint()))
                if (!sub[0]) {
                    msg.channel.send('Jeszcze nie zgłupiałam na tyle żeby 0 zaokrąglić...!')
                    return;
                }
                let rup = Math.round(sub[0]), rdown = Math.floor(sub[1])
                msg.channel.send(`Liczba \`${sub[0]}\`, zaokrąglona w góre daje \`${rup}\`. Natomiast w dół \`${rdown}\``)
            case 'random':
                sub.push(Keiko.interpenter.readPoint())
                if (!sub[0]) {
                    msg.channel.send("Brak mi maksymalnej liczby")
                    return
                }
                sub.push(Keiko.interpenter.readPoint())
                if (!sub[1]) sub[1] = 1
                msg.channel.send(new Keiko.Discord.RichEmbed().setTitle('Losowańsko').addField(`Randomowa liczba z przedziału ${sub[1]} - ${sub[0]}`, utils.genRandom(sub[1], sub[0])))
                break;
                break;
            default:
                msg.channel.send(new Keiko.Discord.RichEmbed().setTitle('Opcje komendy `math`').addField('Dostępne:',
                    `> fibonacci <miejsce> - Oblicza miejsce w ciagu fibonacciego!
                > dzielniki <liczba> - Pokazuje wszystkie dzielniki liczby!
                > round <liczba> - Zaokrąglam liczbę!
                > random <max> [min] - Losuję liczbe z przedziału (jeśli nie podasz min wezme 1)
                > percent <liczba> <procent> - Liczy procent określonej liczby alias: \`%\``))
        }
    }
}

function fibonacci(num) {
    if (num == 0 || num == 1) return fibonacciTab[`${num}`]
    else {
        if (!fibonacciTab[`${num}`]) {
            fibonacciTab[`${num}`] = fibonacci(num - 1) + fibonacci(num - 2)
            return fibonacciTab[`${num}`];
        } else {
            return fibonacciTab[`${num}`];
        }
    }
}

function dzielniki(num) {
    arr = []
    for (let i = 1; i <= num; i++) {
        if (num % i == 0) arr.push(i)
    }
    return arr.join(' ')
}