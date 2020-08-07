module.exports = function (body) {
  return `
  <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" type="text/css" href="css/styles.css" />
    <title>Dashboard</title>
  </head>
  <body><div class="pt-5 col-10 m-auto card-deck">${body}</div></body>
</html>`;
};
