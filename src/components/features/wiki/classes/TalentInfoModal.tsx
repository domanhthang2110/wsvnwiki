"use client";

import React from "react";
import InfoModal from "@/components/ui/InfoModal";
import Dropdown from "@/components/ui/Dropdown/Dropdown";
import LongButton from "@/components/ui/LongButton";
import { TalentLevelValue } from "@/types/talents";
import { useTalentTreeInteractiveStore } from "./talent-tree-store";

const TalentInfoModal: React.FC = () => {
    const selectedTalent = useTalentTreeInteractiveStore(
        (state) => state.selectedTalent
    );
    const selectedNode = useTalentTreeInteractiveStore(
        (state) => state.selectedNode
    );
    const modalLevel = useTalentTreeInteractiveStore((state) => state.modalLevel);
    const setSelectedTalent = useTalentTreeInteractiveStore(
        (state) => state.setSelectedTalent
    );
    const setModalLevel = useTalentTreeInteractiveStore(
        (state) => state.setModalLevel
    );
    const setNodeLevel = useTalentTreeInteractiveStore(
        (state) => state.setNodeLevel
    );

    const handleConfirmTalentLevel = (nodeId: string, level: number) => {
        setNodeLevel(nodeId, level);
        setSelectedTalent(null);
    };

    if (!selectedTalent) return null;

    return (
        <InfoModal
            data={selectedTalent}
            isOpen={!!selectedTalent}
            onClose={() => setSelectedTalent(null)}
            title={selectedTalent.name}
            iconUrl={selectedTalent.icon_url ?? undefined}
            width="334px"
            footer={() => (
                <div className="flex justify-between w-full">
                    <LongButton
                        onClick={() => setSelectedTalent(null)}
                        text="Hủy"
                        width={100}
                    />
                    <LongButton
                        onClick={() => {
                            if (selectedNode) {
                                handleConfirmTalentLevel(selectedNode.id, modalLevel);
                            }
                        }}
                        text="Lưu"
                        width={100}
                    />
                </div>
            )}
        >
            <div className="mt-4">
                <div className="flex items-center justify-center mb-4">
                    <Dropdown
                        title={`${modalLevel} / ${selectedTalent.max_level}`}
                        width="188px"
                        showArrows
                        dropdownDisabled={true}
                        onPrevious={() => setModalLevel(Math.max(0, modalLevel - 1))}
                        onNext={() =>
                            setModalLevel(
                                Math.min(selectedTalent.max_level || 0, modalLevel + 1)
                            )
                        }
                    >
                        {/* This content will not be shown, but it's required by the component */}
                        <div></div>
                    </Dropdown>
                </div>
                <div className="min-h-[6em]">
                    <p className="text-gray-300 mb-4">
                        {(() => {
                            if (
                                !selectedTalent.description ||
                                !selectedTalent.level_values
                            ) {
                                return selectedTalent.description;
                            }

                            const placeholder = /{\w+}/g;
                            const match = selectedTalent.description.match(placeholder);
                            if (!match) {
                                return selectedTalent.description;
                            }

                            const key = match[0].slice(1, -1);

                            if (modalLevel === 0) {
                                const allValues = selectedTalent.level_values
                                    .map((lv: TalentLevelValue) => lv[key])
                                    .join(" / ");
                                return selectedTalent.description.replace(
                                    placeholder,
                                    allValues
                                );
                            }

                            const levelValue = selectedTalent.level_values.find(
                                (lv: TalentLevelValue) => lv.level === modalLevel
                            );
                            if (levelValue) {
                                return selectedTalent.description.replace(
                                    placeholder,
                                    String(levelValue[key] ?? "")
                                );
                            }
                            return selectedTalent.description;
                        })()}
                    </p>
                </div>
            </div>
        </InfoModal>
    );
};

export default TalentInfoModal;
