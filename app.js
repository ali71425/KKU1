'use strict';


const API_URL =
  'https://script.google.com/macros/s/AKfycbxEpSTgr8aB6qaImgfQ7jl8-obnO2eVGvC-2c9ez9TQpu_hEOkSn9uj9xnQV_1sH7aE/exec';


const form =
  document.getElementById('certificateForm');

const emailInput =
  document.getElementById('email');

const searchButton =
  document.getElementById('searchButton');

const loading =
  document.getElementById('loading');

const message =
  document.getElementById('message');

const result =
  document.getElementById('result');

const personName =
  document.getElementById('personName');

const personType =
  document.getElementById('personType');

const certificateButton =
  document.getElementById('certificateButton');


document.getElementById('year').textContent =
  new Date().getFullYear();


form.addEventListener(
  'submit',
  async function (event) {

    event.preventDefault();

    resetUI();

    const email =
      normalizeEmail(
        emailInput.value
      );

    if (!isValidEmail(email)) {

      showError(
        'يرجى إدخال بريد إلكتروني صحيح.'
      );

      emailInput.focus();

      return;
    }

    setLoading(true);

    try {

      const url =
        API_URL +
        '?email=' +
        encodeURIComponent(email);

      const response =
        await fetch(
          url,
          {
            method: 'GET',
            cache: 'no-store'
          }
        );

      if (!response.ok) {

        throw new Error(
          'HTTP ' +
          response.status
        );
      }

      const data =
        await response.json();


      if (!data.success) {

        showError(
          data.message ||
          'تعذر تنفيذ عملية البحث.'
        );

        return;
      }


      if (!data.found) {

        showError(
          data.message ||
          'لم يتم العثور على شهادة مرتبطة بهذا البريد الإلكتروني.'
        );

        return;
      }


      if (!data.certificateUrl) {

        showError(
          'تم العثور على بياناتك، ولكن الشهادة غير متاحة للتحميل حاليًا.'
        );

        return;
      }


      showCertificate(data);


    } catch (error) {

      console.error(
        'Certificate lookup error:',
        error
      );

      showError(
        'تعذر الاتصال بخدمة الشهادات حاليًا. يرجى المحاولة مرة أخرى.'
      );

    } finally {

      setLoading(false);
    }
  }
);


function showCertificate(data) {

  /*
   * نستخدم textContent وليس innerHTML
   * لمنع إدخال HTML أو XSS.
   */

  personName.textContent =
    String(data.name || '');

  personType.textContent =
    String(data.type || '');


  const safeUrl =
    validateCertificateUrl(
      data.certificateUrl
    );


  if (!safeUrl) {

    showError(
      'رابط الشهادة غير صالح.'
    );

    return;
  }


  certificateButton.href =
    safeUrl;


  result.classList.remove(
    'hidden'
  );
}


function validateCertificateUrl(url) {

  try {

    const parsed =
      new URL(url);


    /*
     * السماح بروابط Google Drive عبر HTTPS فقط.
     */

    if (
      parsed.protocol !== 'https:'
    ) {
      return null;
    }


    const allowedHosts = [
      'drive.google.com',
      'docs.google.com'
    ];


    if (
      !allowedHosts.includes(
        parsed.hostname
      )
    ) {
      return null;
    }


    return parsed.href;

  } catch {
    return null;
  }
}


function normalizeEmail(email) {

  return String(email || '')
    .trim()
    .toLowerCase();
}


function isValidEmail(email) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(email);
}


function resetUI() {

  message.className =
    'message hidden';

  message.textContent =
    '';

  result.classList.add(
    'hidden'
  );

  personName.textContent =
    '';

  personType.textContent =
    '';

  certificateButton.removeAttribute(
    'href'
  );
}


function showError(text) {

  result.classList.add(
    'hidden'
  );

  message.textContent =
    text;

  message.className =
    'message error';
}


function setLoading(state) {

  searchButton.disabled =
    state;

  emailInput.disabled =
    state;


  searchButton.textContent =
    state
      ? 'جارٍ البحث...'
      : 'استعلام عن الشهادة';


  loading.classList.toggle(
    'hidden',
    !state
  );
}
