module.exports = {
    wrap: (s, w) => {
        s = s.replace(new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'), '$1\n')
        return s.split('\n');
    },
    genRandom: (min, max) => { return Math.floor(Math.random() * (+max - +min)) + +min; }
}