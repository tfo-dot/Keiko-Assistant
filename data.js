let status = {
    'off': 'Ta komenda jest wyłączona!',
    'service': 'Ta komenda jest w trakcie modernizacji i nie które funkcje mogą nie działać!',
    'unstable': 'Ta komenda jest nie stabilna i może w 100% nie działać poprawnie!'
}
let help = {
    title: 'Lista wszystkich komend! Prefix `keiko!`',
    data: [
        { name: '4fun', text: '`meme`, `card`, `math`, `booru`, `radio`' },
        { name: 'Inne', text: '`info`, `avatar`, `voting`' },
        { name: "Developerskie", text: '`font`' },
        { name: "Jeśli chcesz dowiedzieć się czegoś więcej", text: "Wpisz `help` po danej komendzie" }
    ]
}

module.exports = { status, help }