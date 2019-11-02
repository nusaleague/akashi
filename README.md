# akashi

> "I'll support the girls in the front lines!"
>
> -- Akashi

akashi adalah server yang menyediakan API Nusa Mascot League (https://api.nusaleague.com).

## Panduan development

### Kebutuhan awal

- Node.js
- npm
- MySQL

### Tahapan pemasangan

#### Instalasi

Untuk memasang akashi di komputer Anda, clone repositori ini dan jalankan `npm install` untuk memasang dependency packages:

```sh
$ git clone git@github.com:nusaleague/akashi
$ cd akashi
$ npm install
```

#### Konfigurasi

Salin file `default.env` menjadi file `.env`:

```
$ cp default.env .env
```

Kemudian ubah file `.env` seperlunya. Anda perlu membuat sebuah database MySQL dan memberikan akses ke database tersebut untuk akashi (alamat, username, password, dan nama database).

Jika ingin menggunakan fitur login via Facebook/Google, Anda perlu membuat sebuah client ID dan client secret.

#### Inisialisasi database

akashi menggunakan modul Knex untuk mengakses database dan melakukan migrasi tabel dan data. Untuk migrasi ke versi database terbaru, jalankan perintah ini:

```sh
$ npm run knex -- migrate:latest
```

Jika terdapat perubahan pada database, jalankan perintah ini kembali.

#### Jalankan development server

Setelah database dipasang, Anda dapat menyalakan akashi:

```sh
$ npm run dev
```

akashi akan berjalan di port 3000 (default).

#### Jalankan file server

Server Nusa Mascot League menyediakan file server di https://files.nusaleague.com yang biasanya digunakan untuk mengakses aset seperti gambar maskot. Untuk keperluan development, Anda dapat menjalankan file server development lewat perintah berikut:

```sh
$ npm run dev:files
```

File server akan berjalan di port 3001 (default). Untuk menyajikan file, masukkan file yang akan diakses ke dalam folder `.dev/files`.

## Dokumentasi

_TBA_

## Cara berkontribusi

_TBA_

## Lisensi

akashi dikelola oleh Nusa Mascot League dan dilisensi di bawah [MIT License][license].

[license]: https://github.com/nusaleague/akashi/blob/master/LICENSE
