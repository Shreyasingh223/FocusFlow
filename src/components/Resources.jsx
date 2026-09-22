import { useState } from "react";
import {
    Plus,
    Trash2,
    FileText,
    Image,
    File,
    ExternalLink,
    Upload,
} from "lucide-react";

import "./Resources.css";

function Resources() {
    const [resources, setResources] = useState(() => {
        const savedResources =
            localStorage.getItem("focusflow-resources");

        return savedResources
            ? JSON.parse(savedResources)
            : [];
    });

    const [showForm, setShowForm] = useState(false);

    const [resourceName, setResourceName] = useState("");
    const [category, setCategory] = useState("Study Material");
    const [selectedFile, setSelectedFile] = useState(null);

    // Save resources
    const saveResources = (updatedResources) => {
        setResources(updatedResources);

        localStorage.setItem(
            "focusflow-resources",
            JSON.stringify(updatedResources)
        );
    };

    // Convert file into browser-readable format
    const readFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;

            reader.readAsDataURL(file);
        });
    };

    // Add resource
    const addResource = async (e) => {
        e.preventDefault();

        if (!resourceName.trim() || !selectedFile) {
            return;
        }

        try {
            const fileData = await readFile(selectedFile);

            const newResource = {
                id: Date.now(),
                name: resourceName.trim(),
                category,
                fileName: selectedFile.name,
                fileType: selectedFile.type,
                fileData,
                addedAt: new Date().toISOString(),
            };

            saveResources([
                ...resources,
                newResource,
            ]);

            // Reset form
            setResourceName("");
            setCategory("Study Material");
            setSelectedFile(null);
            setShowForm(false);

            document.getElementById("resource-file").value = "";
        } catch (error) {
            console.error("Error reading file:", error);
            alert("Unable to upload this file.");
        }
    };

    // Delete resource
    const deleteResource = (id) => {
        const updatedResources = resources.filter(
            (resource) => resource.id !== id
        );

        saveResources(updatedResources);
    };

    // Open resource
    const openResource = (resource) => {
        const newWindow = window.open();

        if (!newWindow) {
            alert("Please allow pop-ups to view the resource.");
            return;
        }

        newWindow.document.write(`
      <html>
        <head>
          <title>${resource.name}</title>
          <style>
            body {
              margin: 0;
              background: #f4f4f7;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }

            img {
              max-width: 95%;
              max-height: 95vh;
              object-fit: contain;
            }

            iframe {
              width: 100%;
              height: 100vh;
              border: none;
            }
          </style>
        </head>

        <body>
          ${resource.fileType.startsWith("image/")
                ? `<img src="${resource.fileData}" />`
                : `<iframe src="${resource.fileData}"></iframe>`
            }
        </body>
      </html>
    `);

        newWindow.document.close();
    };

    // Get icon according to file type
    const getFileIcon = (resource) => {
        if (resource.fileType.startsWith("image/")) {
            return <Image size={23} />;
        }

        if (resource.fileType === "application/pdf") {
            return <FileText size={23} />;
        }

        return <File size={23} />;
    };

    return (
        <div className="resources-page">

            {/* Header */}

            <div className="resources-header">

                <div>
                    <p className="eyebrow">
                        YOUR STUDY SPACE
                    </p>

                    <h1>
                        Resources 📚
                    </h1>

                    <p>
                        Keep your important study files in one place.
                    </p>
                </div>

                <button
                    className="add-resource-button"
                    onClick={() => setShowForm(!showForm)}
                >
                    <Plus size={18} />
                    Add Resource
                </button>

            </div>


            {/* Upload Form */}

            {showForm && (
                <form
                    className="resource-form"
                    onSubmit={addResource}
                >

                    <div className="form-title">
                        <Upload size={20} />
                        <h2>Add a Resource</h2>
                    </div>


                    <div className="resource-form-grid">

                        <div className="resource-input-group">

                            <label>
                                Resource Name
                            </label>

                            <input
                                type="text"
                                placeholder="e.g. Semester Date Sheet"
                                value={resourceName}
                                onChange={(e) =>
                                    setResourceName(e.target.value)
                                }
                            />

                        </div>


                        <div className="resource-input-group">

                            <label>
                                Category
                            </label>

                            <select
                                value={category}
                                onChange={(e) =>
                                    setCategory(e.target.value)
                                }
                            >
                                <option>Study Material</option>
                                <option>Date Sheet</option>
                                <option>Timetable</option>
                                <option>Handwritten Notes</option>
                                <option>Assignment</option>
                                <option>Other</option>
                            </select>

                        </div>

                    </div>


                    <div className="resource-input-group">

                        <label>
                            Choose PDF or Image
                        </label>

                        <input
                            id="resource-file"
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) =>
                                setSelectedFile(
                                    e.target.files[0]
                                )
                            }
                        />

                        {selectedFile && (
                            <small className="selected-file">
                                Selected: {selectedFile.name}
                            </small>
                        )}

                    </div>


                    <div className="resource-form-actions">

                        <button
                            type="button"
                            className="cancel-resource"
                            onClick={() =>
                                setShowForm(false)
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="save-resource"
                        >
                            Save Resource
                        </button>

                    </div>

                </form>
            )}


            {/* Resource count */}

            <div className="resource-count">
                {resources.length}{" "}
                {resources.length === 1
                    ? "resource"
                    : "resources"}
            </div>


            {/* Resources */}

            {resources.length === 0 ? (

                <div className="empty-resources">

                    <div className="empty-resource-icon">
                        📚
                    </div>

                    <h2>
                        No resources yet
                    </h2>

                    <p>
                        Upload your timetable, date sheet,
                        notes or other important study material.
                    </p>

                    <button
                        onClick={() => setShowForm(true)}
                    >
                        <Plus size={17} />
                        Add your first resource
                    </button>

                </div>

            ) : (

                <div className="resources-grid">

                    {resources
                        .slice()
                        .reverse()
                        .map((resource) => (

                            <div
                                className="resource-card"
                                key={resource.id}
                            >

                                <div className="resource-card-top">

                                    <div className="resource-file-icon">
                                        {getFileIcon(resource)}
                                    </div>

                                    <button
                                        className="delete-resource"
                                        onClick={() =>
                                            deleteResource(resource.id)
                                        }
                                    >
                                        <Trash2 size={17} />
                                    </button>

                                </div>


                                <div className="resource-info">

                                    <span className="resource-category">
                                        {resource.category}
                                    </span>

                                    <h3>
                                        {resource.name}
                                    </h3>

                                    <p>
                                        {resource.fileName}
                                    </p>

                                </div>


                                <button
                                    className="view-resource"
                                    onClick={() =>
                                        openResource(resource)
                                    }
                                >
                                    <ExternalLink size={16} />
                                    View Resource
                                </button>

                            </div>

                        ))}

                </div>

            )}

        </div>
    );
}

export default Resources;