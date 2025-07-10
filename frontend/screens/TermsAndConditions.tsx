import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  Modal,
  View,
  ScrollView,
  StyleSheet,
  Button,
} from "react-native";

interface Props {
  modalVisible: boolean;
  setModalVisible: (param: boolean) => void;
  setTermsAccepted: (param: boolean) => void;
  pendingLocalData: any;
  handleLogin: (data: any) => void;
}

export default function TermsAndConditions({
  modalVisible,
  setModalVisible,
  pendingLocalData,
  handleLogin,
  setTermsAccepted,
}: Props) {
  const termsText = `
# TERMENI ȘI CONDIȚII - PLATFORMĂ TASKOON

## 1. Părțile implicate

Platforma Taskoon (deținută de \[Numele companiei], numită în continuare „Platforma”) oferă un serviciu digital care intermediază prestarea de servicii între două părți:

* **Clientul** - persoana fizică sau juridică care comandă un serviciu prin aplicație;
* **Taskerul** - prestatorul de servicii, persoană fizică independentă, care acceptă comanda și prestează efectiv serviciul.

## 2. Natura serviciului

Platforma:

* asigură interfața de legătură între Client și Tasker;
* colectează plata integrală de la Client;
* reține un comision de 30%;
* transferă 70% din sumă către Tasker după confirmarea prestării serviciului.

Platforma **nu este parte în prestația efectivă a serviciului**, ci doar intermediază.

## 3. Acceptarea condițiilor și a contractelor

Prin utilizarea aplicației și bifarea căsuței „Sunt de acord cu Termenii și Condițiile”, utilizatorii (atât Clientul, cât și Taskerul):

* declară că au citit, înțeles și acceptat toate regulile, drepturile și obligațiile prevăzute în Termenii și Condițiile platformei;
* își asumă implicit toate clauzele contractelor semnate sau acceptate electronic între Platformă și ei, respectiv:

  * Contractul de prestare servicii între Platformă și Tasker,
  * Contractul de furnizare servicii între Platformă și Client.

Această acceptare prin click are valoare juridică egală cu semnătura electronică, fiind suficientă pentru validarea relației contractuale.

## 4. Relația juridică

* Taskerul nu este angajat al platformei. Este un prestator independent de servicii (persoană fizică).
* Clientul este beneficiar direct al serviciului prestat de Tasker.
* Platforma nu răspunde pentru calitatea serviciului prestat, ci doar facilitează tranzacția.

## 5. Plata și impozitele

* Clientul achită integral serviciul în aplicație (ex: 1000 lei).
* Platforma reține 30% comision (ex: 300 lei).
* Taskerul primește 70% (ex: 700 lei).
* **Din suma achitată Taskerului, Platforma reține 12% impozit pe venit conform Codului fiscal art. 90¹**, dacă Taskerul nu deține statut de întreprindere.
* Taskerul nu are obligația de a prezenta chitanță sau factură, dar trebuie să accepte electronic în aplicație că a prestat serviciul.

Exemplu: din 1000 lei achitați de client, taskerul primește 700 - 12% = 616 lei net; impozitul de 84 lei este achitat de platformă în numele lui. Platforma achită impozitul și pentru comisionul ei.

## 6. Confirmarea serviciului

* După efectuarea serviciului, Taskerul va confirma electronic că a prestat serviciul (semnătură digitală sau buton de confirmare în aplicație).
* Această confirmare declanșează transferul sumei către Tasker.

## 7. Răspundere și limitări

* Taskerul este singurul responsabil pentru calitatea și siguranța serviciului prestat.
* Clientul are obligația de a furniza informații corecte.
* Platforma poate media conflictele, dar nu are obligații contractuale privind execuția serviciului.

## 8. Fiscalitate

* Taskerul este informat că Platforma acționează ca plătitor al impozitului reținut la sursă (12% din suma brută), în numele lui.
* Platforma poate elibera dovadă de reținere a impozitului, la cerere.
* Platforma achită impozitul propriu pentru comisionul reținut (30%), conform legislației în vigoare.

## 9. Protecția datelor

Platforma colectează și procesează date personale conform Legii 133/2011 privind protecția datelor. Datele nu sunt partajate fără consimțământ și sunt folosite strict pentru operarea platformei.

## 10. Modificări

Platforma își rezervă dreptul de a modifica Termenii și Condițiile. Orice modificare va fi publicată pe site și în aplicație. Continuarea utilizării constituie acceptarea modificărilor.

---

## 11. Interdicții și utilizare abuzivă

11.1. Este **strict interzisă** folosirea platformei Taskoon în scopuri ilegale, abuzive sau contrare ordinii publice, inclusiv, dar fără a se limita la:

* solicitarea sau oferirea de servicii cu caracter sexual (inclusiv prostituție);
* trafic de persoane;
* exploatarea prin muncă a minorilor sau persoanelor vulnerabile;
* orice activitate care încalcă legislația Republicii Moldova.

11.2. **Platforma nu răspunde sub nicio formă pentru prejudicii directe sau indirecte cauzate de utilizatori care se angajează în activități ilegale**. Răspunderea pentru faptele ilegale revine exclusiv persoanei care le comite.

11.3. În cazul în care Platforma identifică sau primește notificări privind activități suspecte, își rezervă dreptul de a:

* suspenda sau șterge conturile implicate, fără preaviz;
* bloca transferurile de fonduri aferente taskului respectiv;
* notifica autoritățile competente, conform obligațiilor legale.
`;

  return (
    <>
      {/* <TouchableOpacity
        //onPress={() => setModalVisible(true)}
        style={{ alignSelf: "center", marginTop: 10 }}
      >
        <Text style={styles.terms}>Termeni și Condiții</Text>
      </TouchableOpacity> */}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <Text style={styles.termsText}>{termsText}</Text>
            </ScrollView>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Button
                title="Accept"
                onPress={() => {
                  setTermsAccepted(true);
                  setModalVisible(false);
                  handleLogin(pendingLocalData);
                }}
              />
              <Button
                title="Reject"
                onPress={() => {
                  setTermsAccepted(false);
                  setModalVisible(false);
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  terms: {
    color: "blue",
    textDecorationLine: "underline",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  modalContainer: {
    marginHorizontal: 20,
    backgroundColor: "white",
    borderRadius: 10,
    maxHeight: "80%",
    overflow: "hidden",
  },
  termsText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#333",
  },
});
