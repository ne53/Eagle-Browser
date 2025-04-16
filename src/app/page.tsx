"use client"; // Required for useState and useEffect

import * as React from "react";
import { useState, useEffect } from "react";

async function getFolderData() {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/folder/list?token=${process.env.NEXT_PUBLIC_EAGLE_API_TOKEN}`
        );
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        // Ensure data exists and is an array before returning
        return Array.isArray(data?.data) ? data.data : [];
    } catch (error) {
        console.error("Failed to fetch folder data:", error);
        return []; // Return empty array on error
    }
}

async function getItemsForFolder(folderId: string) {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/item/list?token=${process.env.NEXT_PUBLIC_EAGLE_API_TOKEN}&folders=${folderId}`
        );
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        // Ensure data exists and is an array before returning
        return Array.isArray(data?.data) ? data.data : [];
    } catch (error) {
        console.error(`Failed to fetch items for folder ${folderId}:`, error);
        return []; // Return empty array on error
    }
}

interface Folder {
    id: string;
    name: string;
    children?: Folder[]; // Optional children array
}

// Define Item interface based on expected API response (adjust as needed)
interface Item {
    id: string;
    name: string;
    // Add other relevant item properties if known (e.g., thumbnailUrl, fileSize)
}

interface FolderComponentProps {
    folder: Folder;
    level: number;
    isLast: boolean;
    prefix: string;
    // Update signature to accept folderName as well
    onFolderClick: (folderId: string, folderName: string) => void;
}

function FolderComponent({
    folder,
    level,
    isLast,
    prefix,
    onFolderClick,
}: FolderComponentProps) {
    const connector = level > 0 ? (isLast ? "└   " : "├  ") : "";
    const displayPrefix = prefix + connector;
    let childPrefix = "";

    if (level > 0) {
        childPrefix = prefix + (isLast ? " 　   " : "     ");
    }

    const folderContent = (
        <>
            <span style={{ marginRight: "0.5rem", verticalAlign: "middle" }}>
                📁
            </span>
            <span style={{ verticalAlign: "middle" }}>{folder.name}</span>
        </>
    );

    return (
        <div className="folder-item">
            {displayPrefix && (
                <span style={{ verticalAlign: "middle" }}>{displayPrefix}</span>
            )}
            <button
                onClick={() => onFolderClick(folder.id, folder.name)}
                style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    margin: 0,
                    cursor: "pointer",
                    verticalAlign: "middle",
                    fontFamily: "inherit",
                    fontSize: "inherit",
                }}
                title={`Load items for ${folder.name}`}
            >
                {folderContent}
            </button>
            {folder.children &&
                folder.children.map((child, index) => {
                    const isLastChild = index === folder.children!.length - 1;
                    return (
                        <FolderComponent
                            key={child.id}
                            folder={child}
                            level={level + 1}
                            isLast={isLastChild}
                            prefix={childPrefix}
                            onFolderClick={onFolderClick}
                        />
                    );
                })}
        </div>
    );
}

export default function Home() {
    const [folders, setFolders] = useState<Folder[]>([
        {
            id: "onmk",
            name: "Folder icononmk",
            children: [
                {
                    id: "anime",
                    name: "Folder iconanime",
                    children: [
                        {
                            id: "document",
                            name: "Folder iconDocument",
                            children: [
                                {
                                    id: "revuestarlight",
                                    name: "Folder iconレヴュースタァライト",
                                    children: [
                                        {
                                            id: "ohnana",
                                            name: "Folder icon大場なな",
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            id: "clips",
                            name: "Folder iconClips",
                            children: [
                                {
                                    id: "loveLiveClips",
                                    name: "Folder iconlove live clips",
                                },
                            ],
                        },
                        {
                            id: "sc",
                            name: "Folder iconSC",
                        },
                    ],
                },
            ],
        },
    ]);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
        null
    );
    const [selectedFolderName, setSelectedFolderName] = useState<string | null>(
        null
    );
    const [items, setItems] = useState<Item[]>([]);
    const [isLoadingFolders, setIsLoadingFolders] = useState(true);
    const [isLoadingItems, setIsLoadingItems] = useState(false);

    // Fetch initial folder data on mount
    useEffect(() => {
        async function loadInitialFolders() {
            setIsLoadingFolders(true);
            const initialFolders = await getFolderData();
            setFolders(initialFolders);
            setIsLoadingFolders(false);
        }
        loadInitialFolders();
    }, []); // Empty dependency array ensures this runs only once on mount

    // Handler for clicking a leaf folder
    const handleFolderClick = async (folderId: string, folderName: string) => {
        setSelectedFolderId(folderId);
        setSelectedFolderName(folderName);
        setIsLoadingItems(true);
        setItems([]); // Clear previous items
        const fetchedItems = await getItemsForFolder(folderId);
        setItems(fetchedItems);
        setIsLoadingItems(false);
    };

    return (
        <div>
            {/* Folder Tree Section */}
            <div
                style={{
                    fontFamily: "monospace",
                    whiteSpace: "pre",
                    lineHeight: "1.5",
                    marginBottom: "20px", // Add some space below the tree
                    padding: "10px",
                    border: "1px solid #ccc", // Add a border around the tree
                    borderRadius: "4px",
                    maxHeight: "400px", // Limit height and allow scrolling if needed
                    overflowY: "auto",
                }}
            >
                {isLoadingFolders ? (
                    <p>Loading folders...</p>
                ) : folders.length > 0 ? (
                    folders.map((folder, index) => {
                        const isLastRoot = index === folders.length - 1;
                        return (
                            <FolderComponent
                                key={folder.id}
                                folder={folder}
                                level={0}
                                isLast={isLastRoot}
                                prefix=""
                                onFolderClick={handleFolderClick}
                            />
                        );
                    })
                ) : (
                    <p>No folders found.</p>
                )}
            </div>

            {/* Items Section */}
            {selectedFolderId && (
                <div
                    style={{
                        marginTop: "20px",
                        padding: "10px",
                        border: "1px solid #eee",
                        borderRadius: "4px",
                    }}
                >
                    {/* Use stored name or try to find it if not set directly */}
                    <h3>{selectedFolderName || selectedFolderId}</h3>
                    {isLoadingItems ? (
                        <p>Loading items...</p>
                    ) : items.length > 0 ? (
                        <ul
                            style={{
                                listStyle: "none",
                                paddingLeft: "0",
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "10px",
                            }}
                        >
                            {" "}
                            {/* Use flexbox for layout */}
                            {items.map((item) => (
                                <li
                                    key={item.id}
                                    style={{
                                        border: "1px solid #eee",
                                        padding: "10px",
                                        borderRadius: "4px",
                                        width: "150px",
                                        textAlign: "center",
                                    }}
                                >
                                    {" "}
                                    {/* Style list items */}
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/item/rawthumbnail?id=${item.id}&token=${process.env.NEXT_PUBLIC_EAGLE_API_TOKEN}`} // Construct thumbnail URL (added token for consistency)
                                        alt={`Thumbnail for ${item.name}`}
                                        style={{
                                            maxWidth: "100%",
                                            height: "100px",
                                            objectFit: "contain",
                                            marginBottom: "5px",
                                            display: "block",
                                            marginLeft: "auto",
                                            marginRight: "auto",
                                        }} // Basic image styling
                                        loading="lazy" // Lazy load images
                                        onError={(e) => {
                                            // Optional: Handle image loading errors, e.g., show a placeholder
                                            (
                                                e.target as HTMLImageElement
                                            ).style.display = "none"; // Hide broken image icon
                                            // Optionally add a placeholder text/icon here
                                        }}
                                    />
                                    <span
                                        style={{
                                            display: "block",
                                            wordWrap: "break-word",
                                            fontSize: "0.9em",
                                        }}
                                    >
                                        {item.name}
                                    </span>{" "}
                                    {/* Display item name below image */}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No items found in this folder.</p>
                    )}
                </div>
            )}
        </div>
    );
}
