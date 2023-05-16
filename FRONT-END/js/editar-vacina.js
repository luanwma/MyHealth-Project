import { getVaccineById, updateVaccine } from "./services.js";


const getDataVacina = document.getElementById('input-data-vacina');
const getName = document.getElementById('input-nome-vacina');
const getDoseOptions = document.getElementsByName('dose-vacina');
const getImgUrl = document.getElementById('img-vacina');
const getNextVacina = document.getElementById('input-next-vacina');
let getDose = "";

const getImgContainer = document.querySelector('.img-comprovante');

const Form = document.getElementById('form-editar-vacina');
let loadedImg = document.createElement('img');

window.onload = async () => {
  let user = JSON.parse(localStorage.getItem('user'));
  const vaccine = await getVaccineById(user.uid, (window.location.href).substring((window.location.href).indexOf('#') + 1));
  getDataVacina.value = vaccine.data.vaccine_date;
  getName.value = vaccine.data.vaccine_name;
  getDoseOptions.forEach((dose) => {
    if (dose.value === vaccine.data.vaccine_dose) {
      dose.checked = true;
      getDose = dose.value;
    }
  });
  loadedImg.src = vaccine.data.vaccine_img;
  loadedImg.alt = "Comprovante";
  getImgContainer.appendChild(loadedImg);
  if (vaccine.data.vaccine_next_dose !== "") {
    getNextVacina.value = vaccine.data.vaccine_next_dose;
  } else {
    getNextVacina.disabled = true;
  }
}

getDoseOptions.forEach((dose) => {
  dose.addEventListener('change', () => {
    if (dose.value === "Dose única") {
      getNextVacina.disabled = true;
      getNextVacina.value = "";
    } else {
      getNextVacina.disabled = false;
    }
  });
});

getImgUrl.addEventListener('change', (event) => {
  const isEmpty = event.target.files;
  if(!isEmpty.length) {
    getImgContainer.firstChild.src = loadedImg.src;
    getImgContainer.files[0] = '';
  } else {
    if (getImgUrl.files[0].type.startsWith('image/')) {
      getImgContainer.innerHTML = "";
      let img = document.createElement('img');
      img.src = URL.createObjectURL(getImgUrl.files[0]);
      img.alt = "Comprovante";
      getImgContainer.appendChild(img);
    } else {
      Toastify({
        text: "Formato de arquivo inválido. Insira uma imagem.",
        duration: 3000,
        close: true,
        gravity: "bottom",
        position: "right",
        stopOnFocus: true,
        style: {
          background: "linear-gradient(to right, #c60b0b, #cd3544)",
          fontFamily: ("Averia Libre", "sans-serif"),
        },
  
      }).showToast();;
    }
  }
});

const constraints = {
  "data-vacina": {
    presence: { allowEmpty: false, message: 'Data de vacina obrigatória' },
  },
  "nome-vacina": {
    presence: { allowEmpty: false, message: 'Nome de vacina obrigatório' },
  },
  "next-vacina": {
    presence: { allowEmpty: true },
  }
}

const validateForm = () => {
  const fields = {
    "data-vacina": getDataVacina.value,
    "nome-vacina": getName.value,
    "next-vacina": getNextVacina.value,
  }

  let errors = validate(fields, constraints);

  if(errors) {
    for(const id in errors) {
      const input = Form.querySelector(`[name="${id}"]`);
      (input.name !== 'comprovante-vacina' ?
      Toastify({
        text: (errors[id][0]).replace(`${input.previousElementSibling.innerText} `, ""),
        duration: 3000,
        close: true,
        gravity: "bottom",
        position: "right",
        stopOnFocus: true,
        style: {
          background: "linear-gradient(to right, #c60b0b, #cd3544)",
          fontFamily: ("Averia Libre", "sans-serif"),
        },

      }).showToast()
      :
      Toastify({
        text: (errors[id][0]).replace('Comprovante vacina ', ""),
        duration: 3000,
        close: true,
        gravity: "bottom",
        position: "right",
        stopOnFocus: true,
        style: {
          background: "linear-gradient(to right, #c60b0b, #cd3544)",
          fontFamily: ("Averia Libre", "sans-serif"),
        },

      }).showToast()
      );
    }
    return false;
  }
  return true;
}

Form.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    if (validateForm()) {
      getDoseOptions.forEach((d) => {
        if (d.checked) {
          getDose = d.value;
        }
      });
      let vaccine = {};
      if( getImgUrl.files[0] === undefined || getImgUrl.files[0] === null) {
        vaccine = {
          vaccine_date: getDataVacina.value,
          vaccine_name: getName.value,
          vaccine_dose: getDose,
          vaccine_next_dose: getNextVacina.value,
        }
      } else {
        vaccine = {
          vaccine_date: getDataVacina.value,
          vaccine_name: getName.value,
          vaccine_dose: getDose,
          vaccine_img: getImgUrl.files[0],
          vaccine_next_dose: getNextVacina.value,
        }
      }
      
      await updateVaccine((window.location.href).substring((window.location.href).indexOf('#') + 1), vaccine);
    }
  } catch (error) {
    console.log(`Error: ${error}`);
  }
});