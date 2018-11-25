let input = prompt().replace('""', '"').slice(1, -1).split('•');
document.querySelector('input[name="name"]').value = input[1];
document.querySelector('textarea[name="description"]').value = input[2];
document.querySelector('input[name="price"]').value = input[0].replace('$', '');
