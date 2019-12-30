const crypto = require('crypto');
const fs = require('fs');
const util = require('util');
const path = require('path');
const {Router: router} = require('express');
const sharp = require('sharp');
const got = require('got');
const multer = require('multer');
const {default: ow} = require('ow');
const {serviceManager} = require('../lib/service');

const writeFileAsync = util.promisify(fs.writeFile);

const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

module.exports = ({env}) => {
  const database = serviceManager.get('database');

  const route = router();

  const upload = multer();

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
    (req, res, next) =>
      (async () => {
        if (env.RECAPTCHA_BYPASS) {
          next();
          return;
        }

        const response = await got.post(
          'https://www.google.com/recaptcha/api/siteverify',
          {
            json: {
              secret: env.RECAPTCHA_SECRET,
              response: req.body.recaptchaToken,
              remoteip: req.ip
            },
            responseType: 'json'
          }
        );

        const result = response.body;
        if (!result.success) {
          res.sendStatus(401);
          return;
        }

        next();
      })().catch(next),
    (req, res, next) =>
      (async () => {
        ow(
          req.files,
          ow.object.exactShape({
            orgLogo: ow.array.length(1),
            mascotImage: ow.array.length(1)
          })
        );

        const data = JSON.parse(req.body.data);
        ow(
          data,
          ow.object.exactShape({
            orgName: ow.string.maxLength(64),
            orgCategory: ow.string.oneOf([
              'circle',
              'media',
              'community_academic',
              'community_regional',
              'community_general',
              'shop',
              'idol'
            ]),
            orgDescription: ow.string.maxLength(512),
            orgEmail: ow.string.maxLength(128).matches(emailRegex),
            orgLocation: ow.string.maxLength(64),
            orgWebsite: ow.optional.string.maxLength(128),
            orgFacebook: ow.optional.string.maxLength(64),
            orgTwitter: ow.optional.string.maxLength(64),
            orgInstagram: ow.optional.string.maxLength(64),
            orgYoutube: ow.optional.string.maxLength(64),
            mascotName: ow.string.maxLength(64),
            mascotDescription: ow.string.maxLength(512),
            picName: ow.string.maxLength(64),
            picFacebook: ow.string.maxLength(64),
            picEmail: ow.optional.string.maxLength(128).matches(emailRegex)
          })
        );

        const orgLogoBuffer = await sharp(req.files.orgLogo[0].buffer)
          .png()
          .toBuffer();
        const mascotImageBuffer = await sharp(req.files.mascotImage[0].buffer)
          .png()
          .toBuffer();

        const key = crypto.randomBytes(8).toString('hex');

        await writeFileAsync(
          path.resolve(env.FILES_DIR, `register/${key}_orgLogo.png`),
          orgLogoBuffer
        );

        await writeFileAsync(
          path.resolve(env.FILES_DIR, `register/${key}_mascotImage.png`),
          mascotImageBuffer
        );

        await database('register').insert({
          key,
          data_json: JSON.stringify(data) // eslint-disable-line camelcase
        });

        res.sendStatus(200);
      })().catch(next)
  ]);

  return route;
};
