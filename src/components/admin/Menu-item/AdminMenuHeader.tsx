'use client';

import { Button } from "antd";

interface Props {
    onCreate: () => void;
}

export default function AdminMenuHeader({ onCreate }: Props) {
    return (
        <div className="flex justify-between items-center mb-9 mt-10">
            <h1 className="text-4xl font-bold text-gray-800 hover:text-[#edb021] cursor-pointer">Menu Item Management</h1>
            <Button
                size="large"
                className="bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg shadow-md transition"
                onClick={onCreate}
            >
                + Add New Menu Item
            </Button>
        </div>
    );
}
