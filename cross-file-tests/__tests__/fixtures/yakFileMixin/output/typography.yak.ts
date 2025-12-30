var elements = [
    "h1",
    "h2",
    "h3"
];
export var typography = Object.fromEntries(elements.map(function(element, i) {
    return [
        element,
        {
            __yak: '\n        font-family: "Roboto", sans-serif;\n        font-size: '.concat(16 - i * 2, "px;\n        font-weight: 400;\n        line-height: 1.5;\n        letter-spacing: 0.00938em;\n    ")
        }
    ];
}));