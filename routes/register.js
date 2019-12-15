const fs = require('fs');
const { Router: router } = require('express');
const { default: ow } = require('ow');
const multer = require('multer');
const sharp = require('sharp');
const handle = require('../utils/middlewares/handle');
const checkAuth = require('../utils/middlewares/check-auth');
const validate = require('../utils/middlewares/validate');
const recaptcha = require('../utils/middlewares/recaptcha');

const upload = multer();

const route = router();

route.post('/register', [
  checkAuth(),
  upload.fields([
    {
      name: 'orgLogo',
      maxCount: 1
    },
    {
      name: 'mascotImage',
      maxCount: 1
    }
  ]),
  recaptcha(),
  validate(req => {
    ow(
      req,
      ow.object.partialShape({
        files: ow.object.exactShape({
          orgLogo: ow.array.length(1),
          mascotImage: ow.array.length(1)
        }),
        body: ow.object.partialShape({
          data: ow.string.is(value => {
            try {
              JSON.parse(value);
              return true;
            } catch {
              return 'data is not a JSON string';
            }
          })
        })
      })
    );
  }),
  // TODO Implementasi sementara
  handle(async req => {
    const {
      files: {
        orgLogo: [orgLogoFile],
        mascotImage: [mascotImageFile]
      },
      body: { data: dataJSON }
    } = req;

    const orgLogo = await sharp(orgLogoFile.buffer)
      .png()
      .toBuffer();

    const mascotImage = await sharp(mascotImageFile.buffer)
      .png()
      .toBuffer();

    const data = JSON.parse(dataJSON);

    const time = Date.now();
    const orgLogoFileName = `${time}_org.png`;
    const mascotImageFileName = `${time}_mascot.png`;

    fs.writeFileSync(`.dev/${orgLogoFileName}`, orgLogo);
    fs.writeFileSync(`.dev/${mascotImageFileName}`, mascotImage);
    console.info(`orgLogo = .dev/${orgLogoFileName}`);
    console.info(`mascotImage = .dev/${mascotImageFileName}`);
    console.info(data);
  })
]);

module.exports = route;
