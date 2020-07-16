export function LZW_compress(uncompressed) {
    return uncompressed;
    const result = [];
    let word = '';
    let dictSize = 256;
    const dictionary = {};
    for (let i = 0; i < dictSize; i++) {
        dictionary[String.fromCharCode(i)] = i;
    }
    for (let i = 0; i < uncompressed.length; i++) {
        const curChar = uncompressed[i];
        const joinedWord = word + curChar;
        if (dictionary.hasOwnProperty(joinedWord)) {
            word = joinedWord;
        }
        else {
            result.push(dictionary[word]);
            dictionary[joinedWord] = dictSize++;
            word = curChar;
        }
    }
    if (word !== '')
        result.push(dictionary[word]);
    return result
        .map(c => String.fromCharCode(c))
        .join('');
}
export function LZW_decompress(compressedStr, do_it) {
    if (!do_it)
        return compressedStr;
    const compressed = compressedStr.split('').map((c) => c.charCodeAt(0));
    let word = String.fromCharCode(compressed[0]);
    let result = word;
    let entry = '';
    let dictSize = 256;
    const dictionary = {};
    for (let i = 0; i < dictSize; i++) {
        dictionary[i] = String.fromCharCode(i);
    }
    for (let i = 1, len = compressed.length; i < len; i++) {
        let curNumber = compressed[i];
        if (dictionary[curNumber] !== undefined) {
            entry = dictionary[curNumber];
        }
        else {
            if (curNumber === dictSize) {
                entry = word + word[0];
            }
            else {
                throw 'Error in processing';
            }
        }
        result += entry;
        dictionary[dictSize++] = word + entry[0];
        word = entry;
    }
    return result;
}
//# sourceMappingURL=lzw_compression.js.map