import * as Yup from "yup";

function isHttpUrl(value) {
  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export const validationSchema = Yup.object({
  title: Yup.string().trim().required("Le titre est obligatoire."),
  isOnline: Yup.boolean().required(),
  location: Yup.string().when("isOnline", {
    is: true,
    then: (schema) => schema.required("Une adresse est obligatoire en ligne.")
      .test("http-url", "Une adresse http ou https valide est obligatoire en ligne.", isHttpUrl),
    otherwise: (schema) => schema.notRequired(),
  }),
  phoneNumber: Yup.string().matches(/^[0-9]{10}$/, {
    message: "Le téléphone doit contenir exactement dix chiffres.", excludeEmptyString: true,
  }).notRequired(),
  description: Yup.string().notRequired(),
  startDate: Yup.date().typeError("La date de début est invalide.").required("La date de début est obligatoire."),
  endDate: Yup.date().typeError("La date de fin est invalide.").required("La date de fin est obligatoire.")
    .test("after-start", "La fin de l’événement doit être après le début.", function (value) {
      const start = this.resolve(Yup.ref("startDate"));
      return value instanceof Date && start instanceof Date &&
        Number.isFinite(value.getTime()) && Number.isFinite(start.getTime()) && value.getTime() > start.getTime();
    }),
});
