function validateUAENumber(phoneNumber) {
    let formattedNumber;
    if (phoneNumber.startsWith('00971')) {
        formattedNumber = '+971' + phoneNumber.substring(5);
    } else if (phoneNumber.startsWith('0')) {
        formattedNumber = '+971' + phoneNumber.substring(1);
    } else {
        formattedNumber = '+971' + phoneNumber;
    }
    return formattedNumber;
}

module.exports = {
    countryCode: '+971',
    validate: validateUAENumber
};
