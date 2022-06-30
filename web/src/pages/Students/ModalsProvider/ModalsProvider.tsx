import { useEffect, useState } from "react";
import { alertError, alertSuccess } from "../../../components/Alert/Alert";
import { DeleteModal } from "../../../components/DeleteModal/DeleteModal";
import { SaveModal } from "../../../components/SaveModal/SaveModal"
import { formatDateToReceive } from "../../../Tools/formatDateToReceive";
import { validateAllInputs } from "../../../Tools/validateInputs";
import { createEntity, deleteEntity, editEntity, getEntity, getTurmas } from "../requester";
import { updateEntities } from "../Students";
import { fieldValidations, getSaveModalFields } from "./getSaveModalFields";

export let openSaveModal:(targetEntity?: Record<string, unknown>)=>void;
export let openDeleteModal:(targetEntity: Record<string, unknown>)=>void;

export function ModalsProvider() {
    const [targetEntity, setTargetEntity] = useState<Record<string, unknown>>({});
    const [isOpenSaveModal, setIsOpenSaveModal] = useState(false);
    const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});
    const [entity, setEntity] = useState<Record<string, unknown>>({});
    const [isEdit, setIsEdit] = useState(false);
    const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
    const [turmas, setTurmas] = useState<Record<string, unknown>[]>([]);

    useEffect(()=>{
        getTurmas().then(options=>{
            setTurmas(options);
        })
    }, [])

    openSaveModal = (targetEntity?: Record<string, unknown>)=>{ 
        if(targetEntity){
            if(targetEntity._id) {
                setIsEdit(true);
                getEntity(targetEntity._id as string).then(resp=>{
                    setTargetEntity({...resp}); 
                    setEntity({...resp})
                })
            } 
        } else {
            setEntity({
                birthDate: formatDateToReceive(new Date().getFullYear(), new Date().getMonth()+1, new Date().getDate(), "00:00:00")
            });
            setTargetEntity({
                birthDate: formatDateToReceive(new Date().getFullYear(), new Date().getMonth()+1, new Date().getDate(), "00:00:00")
            })
            setIsEdit(false);
        }
        setIsOpenSaveModal(true) 
    }

    openDeleteModal = (targetEntity: Record<string, unknown>)=>{ 
        setTargetEntity({...targetEntity}); 
        setIsOpenDeleteModal(true) 
    }

    return (
        <>
            {
                ((isOpenSaveModal && !isEdit) || (isOpenSaveModal && isEdit && targetEntity && targetEntity._id)) && 
                    <SaveModal
                        titleLabel={isEdit ? "Editar aluna" : "Nova aluna"}
                        showModal={isOpenSaveModal}
                        closeModal={()=>{setIsOpenSaveModal(false); setTargetEntity({}); setErrorMessages({});}}
                        targetEntity={targetEntity}
                        fields={
                            getSaveModalFields({
                                initialEntity: targetEntity, 
                                errorMessages, 
                                onChange: (field: string, value: string | Date | string[] )=>{
                                    const newEntity = {...entity}
                                    newEntity[field] = value;
                                    setEntity(newEntity)
                                },
                                setFieldValidation: (field: string, value: string)=>{
                                    const newValidation = {...errorMessages};
                                    newValidation[field] = value;
                                    setErrorMessages(newValidation);
                                },
                                isEdit,
                                passwordValue: entity.password ? entity.password as string : "",
                                turmas
                            })
                        }
                        footerButtons={[
                            {
                                label: "Cancelar",
                                callback: ()=>{
                                    setTargetEntity({});
                                    setEntity({})
                                    setIsOpenSaveModal(false); 
                                    setErrorMessages({});
                                }
                            },
                            {
                                label: "Salvar",
                                callback: async ()=>{
                                    const validations = {...fieldValidations}
                                    if(isEdit) {
                                        validations.password = [];
                                        validations.retypePassword = [];
                                    }
                                    const validationResult = validateAllInputs({entity, validations, matchValue: entity.password ? entity.password as string : ""})
                                    
                                    if(validationResult.success) {
                                        if(isEdit) {
                                            const success = await editEntity(entity, targetEntity._id as string);
                                            if(success) {
                                                alertSuccess("Aluna editada com sucesso.")
                                                setEntity({});
                                                setTargetEntity({});
                                                setIsOpenSaveModal(false); 
                                                setErrorMessages({});
                                                updateEntities();
                                            }
                                        } else {
                                            const entityToCreate = {
                                                role: "student",
                                                ...entity
                                            };
                                            const success = await createEntity(entityToCreate);
                                            if(success) {
                                                alertSuccess("Aluna cadastrada com sucesso.")
                                                setEntity({});
                                                setTargetEntity({});
                                                setIsOpenSaveModal(false); 
                                                setErrorMessages({});
                                                updateEntities();
                                            }
                                        }
                                    } else {
                                        alertError("Um ou mais campos não estão corretamente preenchidos.")
                                        setErrorMessages(validationResult.errors)
                                    }
                                }
                            },
                        ]}
                    />
            }
            {
                isOpenDeleteModal && 
                    <DeleteModal
                        titleLabel={"Remover aluna"}
                        showModal={isOpenDeleteModal}
                        closeModal={()=>{setIsOpenDeleteModal(false)}}
                        callback={()=>{
                            deleteEntity(targetEntity._id as string);
                            setIsOpenDeleteModal(false);
                            setTargetEntity({});
                            updateEntities();
                        }}
                        bodyLabel={"Essa ação irá remover a aluna."}
                    />
            }
        </>
    )
}