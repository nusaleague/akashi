const fs = require('fs');
const {Router: router} = require('express');
const multer = require('multer');
const sharp = require('sharp');

const upload = multer();

module.exports = () => {
  const route = router();

  route.post('/register', [
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
    (req, res, next) => (async () => {
      if (!req.files) {
        res.sendStatus(400);
        return;
      }

      if (!req.files.orgLogo || !req.files.mascotImage) {
        res.sendStatus(400);
        return;
      }

      const {
        files: {
          orgLogo: [orgLogoFile],
          mascotImage: [mascotImageFile]
        },
        body: {data}
      } = req;

      req.__orgLogo = await sharp(orgLogoFile.buffer).png().toBuffer();
      req.__mascotImage = await sharp(mascotImageFile.buffer).png().toBuffer();
      req.__formData = data;

      next();
    })().catch(next),
    (req, res) => {
      const time = Date.now();
      const orgLogoFileName = `${time}_org.png`;
      const mascotImageFileName = `${time}_mascot.png`;

      fs.writeFileSync(`.dev/${orgLogoFileName}`, req.__orgLogo);
      fs.writeFileSync(`.dev/${mascotImageFileName}`, req.__mascotImage);
      console.log(`orgLogo = ${orgLogoFileName}`);
      console.log(`mascotImage = ${mascotImageFileName}`);
      console.log(`data = ${req.__formData}`);

      res.sendStatus(200);
    }
  ]);

  return route;
};
